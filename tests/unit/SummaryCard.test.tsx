import { render, screen } from "@testing-library/react";
import { SummaryCard } from "@/components/review/SummaryCard";

describe("SummaryCard", () => {
  it("renders the summary text and positives", () => {
    render(
      <SummaryCard
        summary="Solid implementation overall."
        score={82}
        positives={["Clear naming", "Good test coverage"]}
      />
    );

    expect(screen.getByText("Solid implementation overall.")).toBeInTheDocument();
    expect(screen.getByText("Clear naming")).toBeInTheDocument();
    expect(screen.getByText("Good test coverage")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
  });

  it("uses the success color for scores >= 75", () => {
    render(<SummaryCard summary="Great code." score={90} positives={[]} />);
    expect(screen.getByText("90")).toHaveClass("text-success");
  });

  it("uses the warning color for scores between 50 and 74", () => {
    render(<SummaryCard summary="Okay code." score={60} positives={[]} />);
    expect(screen.getByText("60")).toHaveClass("text-warning");
  });

  it("uses the destructive color for scores below 50", () => {
    render(<SummaryCard summary="Needs work." score={30} positives={[]} />);
    expect(screen.getByText("30")).toHaveClass("text-destructive");
  });

  it("renders no positives list when there are none", () => {
    render(<SummaryCard summary="Mixed bag." score={55} positives={[]} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
