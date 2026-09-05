package com.traingps.tracker

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.traingps.tracker.databinding.ActivityMainBinding
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineLocationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        if (fineLocationGranted) {
            checkGpsHardwareEnabled()
            startLocationService()
        } else {
            Toast.makeText(
                this,
                "Satellite GPS permission is required to track train speed and location.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
        observeTripTelemetry()
        requestGpsPermissions()
    }

    private fun requestGpsPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val missing = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missing.isNotEmpty()) {
            permissionLauncher.launch(missing.toTypedArray())
        } else {
            checkGpsHardwareEnabled()
            startLocationService()
        }
    }

    private fun checkGpsHardwareEnabled() {
        val locationManager = getSystemService(LOCATION_SERVICE) as LocationManager
        if (!locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
            AlertDialog.Builder(this)
                .setTitle("Enable Satellite GPS")
                .setMessage("GPS hardware receiver is currently turned off. Please turn ON Location/GPS to track your train offline.")
                .setPositiveButton("Settings") { _, _ ->
                    startActivity(Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS))
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }

    private fun startLocationService() {
        val serviceIntent = Intent(this, GpsService::class.java).apply {
            action = GpsService.ACTION_START
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
    }

    private fun setupListeners() {
        // Toggle Trip Recording
        binding.btnToggleTrip.setOnClickListener {
            val isRecording = TripRecorder.tripStats.value.isRecording
            if (isRecording) {
                TripRecorder.pauseTrip()
                binding.btnToggleTrip.text = getString(R.string.start_trip)
                binding.btnToggleTrip.backgroundTintList = ContextCompat.getColorStateList(this, R.color.accent_cyan)
                binding.btnToggleTrip.setTextColor(ContextCompat.getColor(this, R.color.bg_primary))
            } else {
                TripRecorder.startTrip()
                binding.btnToggleTrip.text = getString(R.string.stop_trip)
                binding.btnToggleTrip.backgroundTintList = ContextCompat.getColorStateList(this, R.color.accent_red)
                binding.btnToggleTrip.setTextColor(Color.WHITE)
            }
        }

        // Reset Trip
        binding.btnResetTrip.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Reset Trip")
                .setMessage("Reset all speedometer metrics and recorded GPS breadcrumbs?")
                .setPositiveButton("Reset") { _, _ ->
                    TripRecorder.resetTrip()
                    binding.btnToggleTrip.text = getString(R.string.start_trip)
                    binding.btnToggleTrip.backgroundTintList = ContextCompat.getColorStateList(this, R.color.accent_cyan)
                    binding.btnToggleTrip.setTextColor(ContextCompat.getColor(this, R.color.bg_primary))
                    binding.offlineMapView.updateTrack()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }

        // Export CSV
        binding.btnExportCsv.setOnClickListener {
            val file = TripRecorder.exportToCsvFile(this)
            if (file != null && file.exists()) {
                val shareIntent = TripRecorder.shareCsvIntent(this, file)
                startActivity(Intent.createChooser(shareIntent, "Share or Save Trip CSV"))
            } else {
                Toast.makeText(this, "No GPS points recorded yet. Click 'START TRIP' first.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun observeTripTelemetry() {
        lifecycleScope.launch {
            TripRecorder.tripStats.collectLatest { stats ->
                // Speed
                val spdInt = stats.currentSpeedKmh.toInt()
                binding.tvSpeed.text = spdInt.toString()
                binding.tvSpeedMps.text = String.format(Locale.US, "%.1f m/s", stats.currentSpeedKmh / 3.6f)

                // Stats row
                binding.tvDistance.text = String.format(Locale.US, "%.2f km", stats.distanceKm)
                binding.tvMaxSpeed.text = "${stats.maxSpeedKmh.toInt()} km/h"
                binding.tvAvgSpeed.text = "${stats.avgSpeedKmh.toInt()} km/h"

                // Coordinates
                if (stats.latitude != null && stats.longitude != null) {
                    binding.tvLatitude.text = String.format(Locale.US, "%.6f°", stats.latitude)
                    binding.tvLongitude.text = String.format(Locale.US, "%.6f°", stats.longitude)
                }
                binding.tvAltitude.text = stats.altitudeMeters?.let { "${it.toInt()} m" } ?: "-- m"

                // GPS Accuracy & Quality
                val quality = LocationUtils.classifyAccuracy(stats.accuracyMeters)
                binding.tvGpsStatus.text = quality.label
                binding.tvGpsStatus.setTextColor(Color.parseColor(quality.colorHex))

                if (stats.accuracyMeters != null) {
                    binding.tvAccuracy.text = String.format(Locale.US, "±%.1f m", stats.accuracyMeters)
                    binding.tvAccuracy.setTextColor(Color.parseColor(quality.colorHex))
                } else {
                    binding.tvAccuracy.text = "Searching satellites..."
                    binding.tvAccuracy.setTextColor(ContextCompat.getColor(this@MainActivity, R.color.accent_amber))
                }

                // Compass
                if (stats.headingDegrees != null && stats.currentSpeedKmh > 1.5f) {
                    val deg = stats.headingDegrees.toInt()
                    binding.tvHeading.text = "$deg°"
                    binding.tvCardinal.text = "${LocationUtils.bearingToCardinal(stats.headingDegrees)} ($deg°)"
                    binding.ivCompassNeedle.rotation = stats.headingDegrees
                } else {
                    binding.tvHeading.text = "---°"
                    binding.tvCardinal.text = "STATIONARY"
                }

                // Duration timer
                val hrs = stats.elapsedSeconds / 3600
                val mins = (stats.elapsedSeconds % 3600) / 60
                val secs = stats.elapsedSeconds % 60
                binding.tvDuration.text = String.format(Locale.US, "%02d:%02d:%02d", hrs, mins, secs)

                // Refresh offline canvas track
                binding.offlineMapView.updateTrack()
            }
        }
    }
}
