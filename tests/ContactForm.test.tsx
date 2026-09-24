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
    for (const label of ["What is this about?", "Full name", "Business email", "Message"]) {
      const control = screen.getByLabelText(label);
      const errorId = control.getAttribute("aria-describedby");
      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(errorId).toBeTruthy();
      expect(document.getElementById(errorId!)).toBeInTheDocument();
    }
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Company (optional)")).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByLabelText("What is this about?")).toHaveFocus();
  });

  it("associates and focuses an invalid optional company value", async () => {
    const user = userEvent.setup();
    render(withTransitionProvider(<ContactForm />));
    await user.selectOptions(screen.getByLabelText("What is this about?"), "general");
    await user.type(screen.getByLabelText("Full name"), "Jane Doe");
    await user.type(screen.getByLabelText("Business email"), "jane@example.com");
    await user.type(screen.getByLabelText("Company (optional)"), "x".repeat(201));
    await user.type(screen.getByLabelText("Message"), "Hello there");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Send message" }));

    const company = screen.getByLabelText("Company (optional)");
    expect(company).toHaveAttribute("aria-invalid", "true");
    expect(company).toHaveAttribute("aria-describedby", "contact-company-error");
    expect(company).toHaveFocus();
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

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Message delivery isn't connected yet.");
    expect(screen.queryByText("Message sent.")).not.toBeInTheDocument();
  });
});
