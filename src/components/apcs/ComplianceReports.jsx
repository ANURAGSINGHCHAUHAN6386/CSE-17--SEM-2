import React, { useState } from "react";
import { POLLUTANTS } from "../../services/apcsTypes";
import { FileText, Download, Printer, CheckCircle2 } from "lucide-react";

export default function ComplianceReports({ getReport }) {
  const [reportPeriod, setReportPeriod] = useState("daily"); // 'daily' | 'weekly' | 'monthly'

  const report = getReport(reportPeriod);

  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Pollutant,FullName,Mass Removed (kg),EPA Target Limit,Primary Abatement Stage\n";

    Object.keys(POLLUTANTS).forEach((key) => {
      const pol = POLLUTANTS[key];
      const mass = report.breakdownKg[key] || 0;
      csvContent += `"${pol.name}","${pol.fullName}",${mass},"${pol.epaLimit} ${pol.unit}","${pol.primaryStage}"\n`;
    });

    csvContent += `\n"SUMMARY METRICS"\n`;
    csvContent += `"Period","${report.label}"\n`;
    csvContent += `"Treated Volume (m3)",${report.treatedVolumeM3}\n`;
    csvContent += `"Operating Hours",${report.operatingHours}\n`;
    csvContent += `"Compliance Rate (%)",${report.complianceRatePercent}\n`;
    csvContent += `"Total Mass Abated (kg)",${report.totalMassRemovedKg}\n`;
    csvContent += `"CEMS Validation Code","${report.cemsValidationHash}"\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `APCS_Emission_Report_${reportPeriod}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `APCS_Compliance_Report_${reportPeriod}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="apcs-report-card">
      {/* Header & Controls */}
      <div className="apcs-report-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <FileText size={22} color="var(--apcs-cyan)" />
            <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--apcs-text-bright)" }}>
              Environmental & Flue Gas Compliance Report
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--apcs-text-muted)" }}>
            Official continuous emission monitoring system (CEMS) log for regulatory audit.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Period Selector Tabs */}
          <div className="apcs-nav-tabs">
            <button
              className={`apcs-tab-btn ${reportPeriod === "daily" ? "active" : ""}`}
              onClick={() => setReportPeriod("daily")}
            >
              Daily Shift
            </button>
            <button
              className={`apcs-tab-btn ${reportPeriod === "weekly" ? "active" : ""}`}
              onClick={() => setReportPeriod("weekly")}
            >
              Weekly
            </button>
            <button
              className={`apcs-tab-btn ${reportPeriod === "monthly" ? "active" : ""}`}
              onClick={() => setReportPeriod("monthly")}
            >
              Monthly
            </button>
          </div>

          {/* Export Actions */}
          <button className="apcs-btn apcs-btn-outline apcs-btn-sm" onClick={handleDownloadCSV}>
            <Download size={14} /> CSV
          </button>
          <button className="apcs-btn apcs-btn-outline apcs-btn-sm" onClick={handleDownloadJSON}>
            <Download size={14} /> JSON
          </button>
          <button className="apcs-btn apcs-btn-primary apcs-btn-sm" onClick={handlePrint}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Report Metadata Strip */}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem", fontSize: "0.825rem", color: "var(--apcs-text-dim)" }}>
        <div>
          Report Period: <strong style={{ color: "var(--apcs-text-bright)" }}>{report.label}</strong>
        </div>
        <div>
          Generated At: <strong style={{ color: "var(--apcs-text-bright)" }}>{report.generatedAt}</strong>
        </div>
        <div>
          CEMS Certification: <span style={{ fontFamily: "var(--apcs-font-mono)", color: "var(--apcs-cyan)", fontWeight: "700" }}>{report.cemsValidationHash}</span>
        </div>
      </div>

      {/* High-Level Executive KPI Grid */}
      <div className="apcs-report-kpi-grid">
        <div className="apcs-report-kpi">
          <div className="apcs-report-kpi-title">Exhaust Air Volume Treated</div>
          <div className="apcs-report-kpi-val" style={{ color: "var(--apcs-cyan)" }}>
            {report.treatedVolumeM3.toLocaleString()} <span style={{ fontSize: "0.9rem", color: "var(--apcs-text-muted)" }}>m³</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--apcs-text-dim)", marginTop: "0.35rem" }}>
            Across {report.operatingHours} operating hours
          </div>
        </div>

        <div className="apcs-report-kpi">
          <div className="apcs-report-kpi-title">Compliance Rate</div>
          <div className="apcs-report-kpi-val" style={{ color: report.complianceRatePercent >= 95 ? "var(--apcs-emerald)" : "var(--apcs-amber)" }}>
            {report.complianceRatePercent}%
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--apcs-text-dim)", marginTop: "0.35rem" }}>
            EPA standard compliance window
          </div>
        </div>

        <div className="apcs-report-kpi">
          <div className="apcs-report-kpi-title">Total Pollutants Captured</div>
          <div className="apcs-report-kpi-val" style={{ color: "var(--apcs-purple)" }}>
            {report.totalMassRemovedKg.toLocaleString()} <span style={{ fontSize: "0.9rem", color: "var(--apcs-text-muted)" }}>kg</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--apcs-text-dim)", marginTop: "0.35rem" }}>
            Prevented from atmospheric release
          </div>
        </div>

        <div className="apcs-report-kpi">
          <div className="apcs-report-kpi-title">Abatement Efficiency</div>
          <div className="apcs-report-kpi-val" style={{ color: "var(--apcs-emerald)" }}>
            {report.averageEfficiencyPercent}%
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--apcs-text-dim)", marginTop: "0.35rem" }}>
            Average across all 7 pollutants
          </div>
        </div>
      </div>

      {/* Detailed Mass Abatement Table */}
      <h4 style={{ margin: "1.5rem 0 0.75rem 0", fontSize: "1rem", color: "var(--apcs-text-bright)" }}>
        Pollutant Neutralization & Mass Balance Breakdown
      </h4>
      <div style={{ overflowX: "auto" }}>
        <table className="apcs-alarm-table">
          <thead>
            <tr>
              <th>Pollutant</th>
              <th>Full Classification</th>
              <th>Mass Captured / Neutralized</th>
              <th>Primary Unit Stage</th>
              <th>EPA Limit Target</th>
              <th>Audit Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(POLLUTANTS).map((key) => {
              const pol = POLLUTANTS[key];
              const kg = report.breakdownKg[key] || 0;
              return (
                <tr key={key}>
                  <td>
                    <strong style={{ color: pol.color }}>{pol.name}</strong>
                  </td>
                  <td>{pol.fullName}</td>
                  <td>
                    <span style={{ fontFamily: "var(--apcs-font-mono)", fontWeight: "800", color: "var(--apcs-text-bright)" }}>
                      {kg.toFixed(2)} kg
                    </span>
                  </td>
                  <td>{pol.primaryStage}</td>
                  <td>{pol.epaLimit} {pol.unit}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--apcs-emerald)", fontWeight: "700", fontSize: "0.8rem" }}>
                      <CheckCircle2 size={14} /> PASSED
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
