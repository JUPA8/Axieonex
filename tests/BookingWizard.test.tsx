import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingWizard } from "@/components/booking/BookingWizard";

describe("BookingWizard", () => {
  it("starts on the intro screen", () => {
    render(<BookingWizard />);
    expect(screen.getByRole("heading", { name: "Let's map your revenue system." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });

  it("blocks advancing past step 1 until every required field is valid", async () => {
    const user = userEvent.setup();
    render(<BookingWizard />);
    await user.click(screen.getByRole("button", { name: "Start" }));

    expect(screen.getByRole("heading", { name: "Personal details" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Please enter your full name.")).toBeInTheDocument();
    // Still on step 1: the heading has not changed.
    expect(screen.getByRole("heading", { name: "Personal details" })).toBeInTheDocument();
  });

  it("advances to step 2 once step 1 is valid, moving focus to the new step heading", async () => {
    const user = userEvent.setup();
    render(<BookingWizard />);
    await user.click(screen.getByRole("button", { name: "Start" }));

    await user.type(screen.getByLabelText("Full name"), "Jane Doe");
    await user.type(screen.getByLabelText("Business email"), "jane@example.com");
    await user.type(screen.getByLabelText("Phone number"), "+1 555 0100");
    await user.type(screen.getByLabelText("Role"), "CEO");
    await user.click(screen.getByRole("button", { name: "Next" }));

    const heading = screen.getByRole("heading", { name: "Company profile" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveFocus();
  });

  it("returns to step 1 with data intact when Back is pressed from step 2", async () => {
    const user = userEvent.setup();
    render(<BookingWizard />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.type(screen.getByLabelText("Full name"), "Jane Doe");
    await user.type(screen.getByLabelText("Business email"), "jane@example.com");
    await user.type(screen.getByLabelText("Phone number"), "+1 555 0100");
    await user.type(screen.getByLabelText("Role"), "CEO");
    await user.click(screen.getByRole("button", { name: "Next" }));

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("heading", { name: "Personal details" })).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveValue("Jane Doe");
  });
});
