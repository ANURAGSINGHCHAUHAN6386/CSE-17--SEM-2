package com.traingps.tracker

import java.text.SimpleDateFormat
import java.util.*

/**
 * Represents an individual GPS fix captured during a train trip.
 */
data class TripPoint(
    val timestamp: Long,
    val latitude: Double,
    val longitude: Double,
    val speedKmh: Float,
    val altitudeMeters: Double,
    val headingDegrees: Float,
    val accuracyMeters: Float,
    val accumulatedDistanceKm: Double
) {
    fun toCsvRow(): String {
        val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }
        val isoDate = isoFormat.format(Date(timestamp))
        return "$isoDate,$timestamp,%.6f,%.6f,%.1f,%.1f,%.0f,%.1f,%.2f\r\n".format(
            Locale.US,
            latitude,
            longitude,
            speedKmh,
            altitudeMeters,
            headingDegrees,
            accuracyMeters,
            accumulatedDistanceKm
        )
    }

    companion object {
        val CSV_HEADER = "Timestamp_ISO,Unix_Time_MS,Latitude,Longitude,Speed_kmh,Altitude_m,Heading_deg,Accuracy_m,Distance_Accum_km\r\n"
    }
}
