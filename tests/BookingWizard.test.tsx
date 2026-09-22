import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const actionMocks = vi.hoisted(() => ({ gate: vi.fn(), status: vi.fn() }));
vi.mock("@/app/book-strategy-call/actions", () => ({ verifyBookingGateAction: actionMocks.gate, getBookingStatusAction: actionMocks.status }));
vi.mock("@/components/transition/TransitionLink", () => ({ TransitionLink: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));

import { BookingWizard } from "@/components/booking/BookingWizard";

async function reachScheduling() {
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

  it("honestly displays unavailable when server verification is not configured", async () => {
    actionMocks.gate.mockResolvedValue({ status: "unavailable" });
    await reachScheduling();
    expect(await screen.findByRole("heading", { name: "Scheduling is temporarily unavailable." })).toBeInTheDocument();
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
