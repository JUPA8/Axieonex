import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQ } from "@/components/ui/FAQ";

const ITEMS = [
  { question: "What does Axieonex provide?", answer: "A complete outbound revenue system." },
  { question: "How does qualification work?", answer: "Every reply is reviewed by a human." },
];

describe("FAQ", () => {
  it("renders every question and keeps answers collapsed by default", () => {
    const { container } = render(<FAQ items={ITEMS} />);
    for (const item of ITEMS) {
      expect(screen.getByText(item.question)).toBeInTheDocument();
    }
    const detailsElements = container.querySelectorAll("details");
    expect(detailsElements).toHaveLength(ITEMS.length);
    detailsElements.forEach((el) => expect(el).not.toHaveAttribute("open"));
  });

  it("opens an item on click, exposing its answer", async () => {
    const user = userEvent.setup();
    render(<FAQ items={ITEMS} />);
    await user.click(screen.getByText(ITEMS[0].question));
    expect(screen.getByText(ITEMS[0].answer)).toBeVisible();
  });

  it("omits the heading when none is provided", () => {
    render(<FAQ items={ITEMS} heading="" />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
