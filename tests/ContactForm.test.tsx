import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/contact/ContactForm";
import { withTransitionProvider } from "./testUtils";

vi.mock("next/navigation", () => ({
  usePathname: () => "/contact",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ContactForm", () => {
  it("shows field-level validation errors on an empty submit", async () => {
    const user = userEvent.setup();
    render(withTransitionProvider(<ContactForm />));
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByText("Please select a topic.")).toBeInTheDocument();
    expect(screen.getByText("Please enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a message.")).toBeInTheDocument();
    expect(screen.getByText("Please accept the privacy terms.")).toBeInTheDocument();
  });

  it("honestly reports delivery is not connected instead of a fake success", async () => {
    const user = userEvent.setup();
    render(withTransitionProvider(<ContactForm />));

    await user.selectOptions(screen.getByLabelText("What is this about?"), "general");
    await user.type(screen.getByLabelText("Full name"), "Jane Doe");
    await user.type(screen.getByLabelText("Business email"), "jane@example.com");
    await user.type(screen.getByLabelText("Message"), "Hello there");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByText("Message delivery isn't connected yet.")).toBeInTheDocument();
    expect(screen.queryByText("Message sent.")).not.toBeInTheDocument();
  });
});
