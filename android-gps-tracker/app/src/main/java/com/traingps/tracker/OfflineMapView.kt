package com.traingps.tracker

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View

/**
 * Custom 100% offline vector track renderer.
 * Draws the train's live GPS breadcrumbs, route curvature, and speed gradient
 * on an Android Canvas without requiring any map tiles or internet connection.
 */
class OfflineMapView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val gridPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#121A2C")
        strokeWidth = 2f
        style = Paint.Style.STROKE
    }

    private val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        strokeWidth = 6f
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    private val markerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#94A3B8")
        textSize = 32f
        typeface = Typeface.MONOSPACE
    }

    fun updateTrack() {
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val w = width.toFloat()
        val h = height.toFloat()

        // Background
        canvas.drawColor(Color.parseColor("#080D16"))

        // Draw HUD grid
        val step = 80f
        var x = 0f
        while (x < w) {
            canvas.drawLine(x, 0f, x, h, gridPaint)
            x += step
        }
        var y = 0f
        while (y < h) {
            canvas.drawLine(0f, y, w, y, gridPaint)
            y += step
        }

        val points = TripRecorder.recordedPoints
        if (points.size < 2) {
            textPaint.textAlign = Paint.Align.CENTER
            textPaint.color = Color.parseColor("#64748B")
            canvas.drawText("OFFLINE VECTOR TRACK VISUALIZER", w / 2f, h / 2f - 20, textPaint)
            canvas.drawText("Recording GPS track points...", w / 2f, h / 2f + 30, textPaint)
            return
        }

        // Calculate bounding box
        var minLat = points[0].latitude
        var maxLat = points[0].latitude
        var minLon = points[0].longitude
        var maxLon = points[0].longitude

        for (p in points) {
            if (p.latitude < minLat) minLat = p.latitude
            if (p.latitude > maxLat) maxLat = p.latitude
            if (p.longitude < minLon) minLon = p.longitude
            if (p.longitude > maxLon) maxLon = p.longitude
        }

        val pad = 60f
        val latSpan = if (maxLat - minLat > 0.0001) maxLat - minLat else 0.001
        val lonSpan = if (maxLon - minLon > 0.0001) maxLon - minLon else 0.001

        fun toX(lon: Double): Float = (pad + ((lon - minLon) / lonSpan) * (w - 2 * pad)).toFloat()
        fun toY(lat: Double): Float = ((h - pad) - ((lat - minLat) / latSpan) * (h - 2 * pad)).toFloat()

        // Draw speed-colored track segments
        for (i in 1 until points.size) {
            val p0 = points[i - 1]
            val p1 = points[i]

            val spd = p1.speedKmh
            trackPaint.color = when {
                spd < 60f -> Color.parseColor("#39FF14")  // Green
                spd < 100f -> Color.parseColor("#00F0FF") // Cyan
                spd < 130f -> Color.parseColor("#F59E0B") // Amber
                else -> Color.parseColor("#EF4444")       // Red
            }

            canvas.drawLine(toX(p0.longitude), toY(p0.latitude), toX(p1.longitude), toY(p1.latitude), trackPaint)
        }

        // Start point marker
        val startX = toX(points.first().longitude)
        val startY = toY(points.first().latitude)
        markerPaint.color = Color.parseColor("#39FF14")
        canvas.drawCircle(startX, startY, 12f, markerPaint)

        // Current train position marker
        val curr = points.last()
        val currX = toX(curr.longitude)
        val currY = toY(curr.latitude)

        markerPaint.color = Color.parseColor("#00F0FF")
        canvas.drawCircle(currX, currY, 18f, markerPaint)

        markerPaint.color = Color.WHITE
        canvas.drawCircle(currX, currY, 8f, markerPaint)

        // Current speed label on track
        textPaint.textAlign = Paint.Align.LEFT
        textPaint.color = Color.parseColor("#00F0FF")
        canvas.drawText("TRAIN: ${curr.speedKmh.toInt()} km/h", currX + 24f, currY + 10f, textPaint)
    }
}
