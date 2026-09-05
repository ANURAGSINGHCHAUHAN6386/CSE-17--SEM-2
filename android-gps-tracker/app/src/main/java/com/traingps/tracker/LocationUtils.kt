package com.traingps.tracker

import kotlin.math.*

enum class GpsSignalQuality(val label: String, val colorHex: String) {
    EXCELLENT("GNSS LOCKED (EXCELLENT)", "#39FF14"),
    STRONG("STRONG SATELLITE", "#00F0FF"),
    MODERATE("MODERATE SIGNAL", "#F59E0B"),
    WEAK("WEAK SIGNAL", "#EF4444"),
    SEARCHING("ACQUIRING GNSS", "#F59E0B")
}

object LocationUtils {

    /**
     * Converts meters per second (m/s) to kilometers per hour (km/h).
     */
    fun mpsToKmh(mps: Float): Float {
        return mps * 3.6f
    }

    /**
     * Calculates the spherical distance in kilometers between two coordinates
     * using the Haversine formula. Works 100% offline without external services.
     */
    fun haversineDistance(
        lat1: Double, lon1: Double,
        lat2: Double, lon2: Double
    ): Double {
        val r = 6371.0 // Mean radius of Earth in km
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val phi1 = Math.toRadians(lat1)
        val phi2 = Math.toRadians(lat2)

        val a = sin(dLat / 2).pow(2) +
                cos(phi1) * cos(phi2) *
                sin(dLon / 2).pow(2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return r * c
    }

    /**
     * Calculates initial forward bearing / azimuth in degrees [0, 360).
     */
    fun calculateBearing(
        lat1: Double, lon1: Double,
        lat2: Double, lon2: Double
    ): Float {
        val phi1 = Math.toRadians(lat1)
        val phi2 = Math.toRadians(lat2)
        val lambdaDiff = Math.toRadians(lon2 - lon1)

        val y = sin(lambdaDiff) * cos(phi2)
        val x = cos(phi1) * sin(phi2) - sin(phi1) * cos(phi2) * cos(lambdaDiff)

        val bearingRad = atan2(y, x)
        val bearingDeg = Math.toDegrees(bearingRad)
        return ((bearingDeg + 360) % 360).toFloat()
    }

    /**
     * Converts bearing degrees into standard 16-point cardinal compass directions.
     */
    fun bearingToCardinal(degrees: Float?): String {
        if (degrees == null) return "STATIONARY"
        val cardinals = arrayOf(
            "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
            "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
        )
        val index = ((degrees / 22.5f) + 0.5f).toInt() % 16
        return cardinals[index]
    }

    /**
     * Categorizes GPS satellite precision based on horizontal accuracy radius (meters).
     */
    fun classifyAccuracy(accuracyMeters: Float?): GpsSignalQuality {
        return when {
            accuracyMeters == null || accuracyMeters <= 0f -> GpsSignalQuality.SEARCHING
            accuracyMeters < 6.0f -> GpsSignalQuality.EXCELLENT
            accuracyMeters < 15.0f -> GpsSignalQuality.STRONG
            accuracyMeters < 30.0f -> GpsSignalQuality.MODERATE
            accuracyMeters < 60.0f -> GpsSignalQuality.WEAK
            else -> GpsSignalQuality.SEARCHING
        }
    }
}
