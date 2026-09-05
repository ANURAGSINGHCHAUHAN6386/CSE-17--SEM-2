package com.traingps.tracker

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import androidx.core.content.FileProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

data class TripStats(
    val currentSpeedKmh: Float = 0f,
    val maxSpeedKmh: Float = 0f,
    val avgSpeedKmh: Float = 0f,
    val distanceKm: Double = 0.0,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val altitudeMeters: Double? = null,
    val headingDegrees: Float? = null,
    val accuracyMeters: Float? = null,
    val elapsedSeconds: Long = 0L,
    val isRecording: Boolean = false,
    val recordedPointsCount: Int = 0
)

object TripRecorder {

    private val _tripStats = MutableStateFlow(TripStats())
    val tripStats: StateFlow<TripStats> = _tripStats.asStateFlow()

    val recordedPoints = mutableListOf<TripPoint>()

    private var lastValidLat: Double? = null
    private var lastValidLon: Double? = null
    private var lastValidTime: Long? = null
    private var tripStartTime: Long? = null

    fun startTrip() {
        if (!_tripStats.value.isRecording) {
            tripStartTime = System.currentTimeMillis() - (_tripStats.value.elapsedSeconds * 1000)
            _tripStats.value = _tripStats.value.copy(isRecording = true)
        }
    }

    fun pauseTrip() {
        _tripStats.value = _tripStats.value.copy(isRecording = false)
    }

    fun resetTrip() {
        recordedPoints.clear()
        lastValidLat = null
        lastValidLon = null
        lastValidTime = null
        tripStartTime = null
        _tripStats.value = TripStats()
    }

    fun onLocationUpdate(
        lat: Double,
        lon: Double,
        rawSpeedMps: Float,
        altMeters: Double,
        rawHeading: Float,
        accuracy: Float
    ) {
        val now = System.currentTimeMillis()

        // 1. Calculate / convert speed
        var speedKmh = if (rawSpeedMps > 0f) {
            LocationUtils.mpsToKmh(rawSpeedMps)
        } else if (lastValidLat != null && lastValidLon != null && lastValidTime != null) {
            val deltaSec = (now - lastValidTime!!) / 1000.0
            if (deltaSec > 0.5) {
                val dist = LocationUtils.haversineDistance(lastValidLat!!, lastValidLon!!, lat, lon)
                (dist / deltaSec * 3600.0).toFloat()
            } else 0f
        } else {
            0f
        }

        // Stationary filter: Trains stopped at stations experience GPS multipath jitter
        if (speedKmh < 1.5f) {
            speedKmh = 0f
        }

        // 2. Heading fallback if sensor doesn't report bearing
        val heading = if (rawHeading > 0f) {
            rawHeading
        } else if (lastValidLat != null && lastValidLon != null && speedKmh > 3f) {
            LocationUtils.calculateBearing(lastValidLat!!, lastValidLon!!, lat, lon)
        } else {
            _tripStats.value.headingDegrees ?: 0f
        }

        // 3. Distance accumulation (Haversine)
        var totalDistance = _tripStats.value.distanceKm
        if (lastValidLat != null && lastValidLon != null) {
            val stepKm = LocationUtils.haversineDistance(lastValidLat!!, lastValidLon!!, lat, lon)
            // Filter jitter: Only add distance if speed > 1 km/h and step is greater than 4 meters
            if (stepKm > 0.004 && speedKmh > 1.0f && accuracy < 35f) {
                totalDistance += stepKm
            }
        }

        // 4. Update Max Speed
        val newMax = maxOf(_tripStats.value.maxSpeedKmh, speedKmh)

        // 5. Elapsed duration
        val elapsedSec = if (tripStartTime != null && _tripStats.value.isRecording) {
            (now - tripStartTime!!) / 1000
        } else {
            _tripStats.value.elapsedSeconds
        }

        // 6. Average speed
        val avgSpeed = if (elapsedSec > 10 && totalDistance > 0.05) {
            ((totalDistance / (elapsedSec / 3600.0))).toFloat()
        } else 0f

        // Record point if recording is active
        if (_tripStats.value.isRecording) {
            val point = TripPoint(
                timestamp = now,
                latitude = lat,
                longitude = lon,
                speedKmh = speedKmh,
                altitudeMeters = altMeters,
                headingDegrees = heading,
                accuracyMeters = accuracy,
                accumulatedDistanceKm = totalDistance
            )
            recordedPoints.add(point)
        }

        lastValidLat = lat
        lastValidLon = lon
        lastValidTime = now

        _tripStats.value = _tripStats.value.copy(
            currentSpeedKmh = speedKmh,
            maxSpeedKmh = newMax,
            avgSpeedKmh = avgSpeed,
            distanceKm = totalDistance,
            latitude = lat,
            longitude = lon,
            altitudeMeters = altMeters,
            headingDegrees = heading,
            accuracyMeters = accuracy,
            elapsedSeconds = elapsedSec,
            recordedPointsCount = recordedPoints.size
        )
    }

    /**
     * Exports recorded points to a CSV file in the device's public Downloads directory
     * and returns the file path.
     */
    fun exportToCsvFile(context: Context): File? {
        if (recordedPoints.isEmpty()) return null

        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val fileName = "train_gps_log_$timeStamp.csv"

        val dir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: context.filesDir
        val file = File(dir, fileName)

        FileOutputStream(file).use { out ->
            out.write(TripPoint.CSV_HEADER.toByteArray())
            for (pt in recordedPoints) {
                out.write(pt.toCsvRow().toByteArray())
            }
        }

        return file
    }

    /**
     * Share CSV file via Android Share sheet (works completely offline).
     */
    fun shareCsvIntent(context: Context, file: File): Intent {
        val uri: Uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )
        return Intent(Intent.ACTION_SEND).apply {
            type = "text/csv"
            putExtra(Intent.EXTRA_SUBJECT, "Train GPS Trip Log")
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
    }
}
