import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion } from "@/components/ui/Accordion";

const ITEMS = [
  { question: "Question one?", answer: "Answer one." },
  { question: "Question two?", answer: "Answer two." },
];

describe("Accordion (FAQ)", () => {
  it("starts with every panel collapsed", () => {
    render(<Accordion items={ITEMS} />);
    for (const item of ITEMS) {
      expect(screen.getByRole("button", { name: item.question })).toHaveAttribute(
        "aria-expanded",
        "false"
      );
    }
  });

  it("expands a panel on click and exposes it via aria-expanded", async () => {
    render(<Accordion items={ITEMS} />);
    const trigger = screen.getByRole("button", { name: ITEMS[0].question });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(ITEMS[0].answer)).toBeVisible();
  });

  it("allows multiple panels open at once, matching the live site's behavior", async () => {
    render(<Accordion items={ITEMS} />);
    await userEvent.click(screen.getByRole("button", { name: ITEMS[0].question }));
    await userEvent.click(screen.getByRole("button", { name: ITEMS[1].question }));
    expect(screen.getByRole("button", { name: ITEMS[0].question })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("button", { name: ITEMS[1].question })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("collapses a panel when clicked again", async () => {
    render(<Accordion items={ITEMS} />);
    const trigger = screen.getByRole("button", { name: ITEMS[0].question });
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
