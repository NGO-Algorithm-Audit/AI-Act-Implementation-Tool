import { useTranslation } from "react-i18next";
import { Table } from "react-bootstrap";

const ROLE_ROWS: { color: string; labelKey: string; descKey: string }[] = [
  { color: "#6f42c1", labelKey: "aiact2 summary role provider",       descKey: "aiact2 intro role provider desc" },
  { color: "#0d6efd", labelKey: "aiact2 summary role deployer",       descKey: "aiact2 intro role deployer desc" },
  { color: "#475569", labelKey: "aiact2 summary role representative", descKey: "aiact2 intro role representative desc" },
  { color: "#198754", labelKey: "aiact2 summary role importer",       descKey: "aiact2 intro role importer desc" },
  { color: "#fd7e14", labelKey: "aiact2 summary role distributor",    descKey: "aiact2 intro role distributor desc" },
  { color: "#6b8a9e", labelKey: "aiact2 summary role private",        descKey: "aiact2 intro role private desc" },
];

export default function RoleStatusIntroWidget() {
  const { t } = useTranslation();

  return (
    <div>
      <p style={{ marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
        {t("aiact2 intro p2 prefix")}
      </p>

      <Table bordered size="sm" style={{ marginBottom: "1rem" }}>
        <thead>
          <tr>
            <th style={{ fontWeight: "bold", fontSize: "0.85rem" }}>{t("aiact2 intro role header")}</th>
            <th style={{ fontWeight: "bold", fontSize: "0.85rem" }}>{t("aiact2 intro role description header")}</th>
          </tr>
        </thead>
        <tbody>
          {ROLE_ROWS.map(({ color, labelKey, descKey }) => (
            <tr key={labelKey}>
              <td style={{ verticalAlign: "middle" }}>
                <span
                  className="badge badge-secondary"
                  style={{ backgroundColor: color, fontSize: "0.85rem", padding: "3.2px 5.12px", color: "#fff" }}
                >
                  {t(labelKey)}
                </span>
              </td>
              <td style={{ verticalAlign: "middle", fontSize: "0.875rem" }}>{t(descKey)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
