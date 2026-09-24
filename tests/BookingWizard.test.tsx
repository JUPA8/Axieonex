import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const actionMocks = vi.hoisted(() => ({ gate: vi.fn(), status: vi.fn() }));
vi.mock("@/app/book-strategy-call/actions", () => ({ verifyBookingGateAction: actionMocks.gate, getBookingStatusAction: actionMocks.status }));
vi.mock("@/components/transition/TransitionLink", () => ({ TransitionLink: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));

import { BookingWizard } from "@/components/booking/BookingWizard";

async function reachReview() {
  const user = userEvent.setup();
  render(<BookingWizard calendlyUrl="https://calendly.com/example/call" />);
  await user.click(screen.getByRole("button", { name: "Start" }));
  await user.type(screen.getByLabelText("Full name"), "Jane Doe");
  await user.type(screen.getByLabelText("Business email"), "jane@example.com");
  await user.type(screen.getByLabelText("Phone number"), "+1 555 0100");
  await user.type(screen.getByLabelText("Role"), "CEO");
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.type(screen.getByLabelText("Company name"), "Acme");
  await user.type(screen.getByLabelText("Company website"), "acme.com");
  await user.type(screen.getByLabelText("Country"), "US");
  await user.selectOptions(screen.getByLabelText("Company size"), "1-10");
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.type(screen.getByLabelText("Current outbound approach"), "Cold email");
  await user.type(screen.getByLabelText("Desired outcome"), "Predictable pipeline");
  await user.type(screen.getByLabelText("Target market"), "North America");
  await user.selectOptions(screen.getByLabelText("Monthly engagement range"), "3k-8k");
  await user.click(screen.getByRole("button", { name: "Next" }));
  return user;
}

async function reachScheduling() {
  const user = await reachReview();
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Continue to scheduling" }));
}

describe("BookingWizard", () => {
  beforeEach(() => vi.clearAllMocks());
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
    for (const label of ["Full name", "Business email", "Phone number", "Role"]) {
      const control = screen.getByLabelText(label);
      const errorId = control.getAttribute("aria-describedby");
      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(errorId).toBeTruthy();
      expect(document.getElementById(errorId!)).toBeInTheDocument();
    }
    expect(screen.getByLabelText("Full name")).toHaveFocus();
    // Still on step 1: the heading has not changed.
    expect(screen.getByRole("heading", { name: "Personal details" })).toBeInTheDocument();
  });

  it("does not mark valid fields invalid and focuses the first remaining invalid field", async () => {
    const user = userEvent.setup();
    render(<BookingWizard />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.type(screen.getByLabelText("Full name"), "Jane Doe");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByLabelText("Full name")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByLabelText("Business email")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Business email")).toHaveFocus();
  });

  it("associates every company and revenue-step error with its control", async () => {
    const user = userEvent.setup();
    render(<BookingWizard />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.type(screen.getByLabelText("Full name"), "Jane Doe");
    await user.type(screen.getByLabelText("Business email"), "jane@example.com");
    await user.type(screen.getByLabelText("Phone number"), "+1 555 0100");
    await user.type(screen.getByLabelText("Role"), "CEO");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    for (const label of ["Company name", "Company website", "Country", "Company size"]) {
      const control = screen.getByLabelText(label);
      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(document.getElementById(control.getAttribute("aria-describedby")!)).toBeInTheDocument();
    }
    expect(screen.getByLabelText("Company name")).toHaveFocus();

    await user.type(screen.getByLabelText("Company name"), "Acme");
    await user.type(screen.getByLabelText("Company website"), "acme.com");
    await user.type(screen.getByLabelText("Country"), "US");
    await user.selectOptions(screen.getByLabelText("Company size"), "1-10");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    for (const label of ["Current outbound approach", "Desired outcome", "Target market", "Monthly engagement range"]) {
      const control = screen.getByLabelText(label);
      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(document.getElementById(control.getAttribute("aria-describedby")!)).toBeInTheDocument();
    }
    expect(screen.getByLabelText("Current outbound approach")).toHaveFocus();
  });

  it("supports keyboard navigation into the wizard without trapping focus", async () => {
    const user = userEvent.setup();
    render(<BookingWizard />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Start" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "Personal details" })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText("Full name")).toHaveFocus();
  });

  it("associates the consent error and focuses its checkbox", async () => {
    const user = await reachReview();
    await user.click(screen.getByRole("button", { name: "Continue to scheduling" }));
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("aria-describedby", "booking-consent-error");
    expect(screen.getByText("Please accept the privacy terms to continue.")).toHaveAttribute("id", "booking-consent-error");
    expect(checkbox).toHaveFocus();
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

  it("honestly displays unavailable when server verification is not configured", async () => {
    actionMocks.gate.mockResolvedValue({ status: "unavailable" });
    await reachScheduling();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Scheduling is temporarily unavailable.");
  });

  it("announces a server-side submission validation failure", async () => {
    actionMocks.gate.mockResolvedValue({ status: "invalid" });
    await reachScheduling();
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong submitting your request.");
  });

  it("shows pending until the signed webhook has confirmed the booking", async () => {
    actionMocks.gate.mockResolvedValue({ status: "ok", correlationId: "axieonex_123e4567-e89b-42d3-a456-426614174000" });
    actionMocks.status.mockResolvedValue({ status: "pending" });
    await reachScheduling();
    window.dispatchEvent(new MessageEvent("message", { origin: "https://calendly.com", data: { event: "calendly.event_scheduled", payload: { event: { uri: "client-controlled" }, invitee: { uri: "client-controlled" } } } }));
    expect(await screen.findByRole("heading", { name: "Calendly is confirming your call." })).toBeInTheDocument();
    expect(actionMocks.status).toHaveBeenCalledWith("axieonex_123e4567-e89b-42d3-a456-426614174000");
  });
});
