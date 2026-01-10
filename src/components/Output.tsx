import { Alert, Button, Card } from "react-bootstrap";
import CodeBlock from "./CodeBlock";
import a11yLight from "react-syntax-highlighter/dist/esm/styles/hljs/a11y-light";
import { dictionaryToCsv } from "../utils/dictionaryToCsv";
import { FormProps } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { useTranslation } from "react-i18next";
import Markdown from "markdown-to-jsx";

export default function Output({
  id,
  type,
  output,
  step,
  handlePrev,
  onSubmit,
  data,
}: {
  id: number;
  type: "output" | "error";
  output: Record<string, string>;
  step: number;
  handlePrev: () => void;
  onSubmit: (
    index: number,
    data: FormProps<any, RJSFSchema, any>["formData"]
  ) => void;
  data: FormProps<any, RJSFSchema, any>["schema"];
}) {
  const { t } = useTranslation();
  // filter out intermediate output from the form data.
  data = Object.fromEntries(
    Object.entries(data).filter(([key]) => !key.startsWith("output"))
  );

  // Enrich the data with the output.
  data = { ...data, output: output.default };
  return (
    <>
      <Card bg={"light"} className="mb-4">
        <Card.Body>
          <Card.Title>{output?.title}</Card.Title>

          <Alert variant="primary" className={type === "error" ? "mb-0" : ""}>
            <Markdown>{output?.default}</Markdown>
          </Alert>
          {data?.additionalOutputText && (
            <Alert variant="info">{data?.additionalOutputText}</Alert>
          )}
          {type === "output" && (
            <>
              <Card.Text>{t("save output")}</Card.Text>

              <CodeBlock
                style={a11yLight}
                code={dictionaryToCsv(data)}
                language={"typescript"}
                title={"CSV"}
                wrapLongLines={false}
              />
              <CodeBlock
                style={a11yLight}
                code={JSON.stringify(data, null, 2)}
                language={"json"}
                title="JSON"
                wrapLongLines={false}
              />
              <Alert variant="warning" className="mt-3 mb-3">
                <small>{t("disclaimer")}</small>
              </Alert>
            </>
          )}
        </Card.Body>
      </Card>
      <div className="d-flex flex-row justify-content-between flex-row-reverse">
        <Button
          onClick={() => onSubmit(id, data)}
          variant="primary"
          type="submit"
        >
          {t("done")}
        </Button>
        {step > 0 && (
          <Button
            type="button"
            variant="outline-secondary"
            onClick={handlePrev}
            style={{ marginRight: "8px" }}
          >
            {t("back")}
          </Button>
        )}
      </div>
    </>
  );
}
