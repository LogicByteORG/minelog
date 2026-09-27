import { redact } from "@/lib/redact";
import { SAMPLE_PRIVATE_LINES } from "@/lib/samples";
import { LogView } from "./log-view";

export function RedactionDemo() {
  const { text: after } = redact(SAMPLE_PRIVATE_LINES);

  return (
    <div className="demo">
      <DemoPane title="Before" text={SAMPLE_PRIVATE_LINES} />
      <DemoPane title="After" text={after} />
    </div>
  );
}

function DemoPane({ title, text }: { title: string; text: string }) {
  return (
    <div className="demo__pane">
      <h3 className="demo__title">{title}</h3>
      <div className="demo__box">
        <LogView
          text={text}
          limit={10}
          label={`${title}: sample lines ${title === "Before" ? "with" : "without"} private details`}
        />
      </div>
    </div>
  );
}

