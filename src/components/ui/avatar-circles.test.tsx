import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { AvatarCircles } from "./avatar-circles"

describe("AvatarCircles", () => {
  const mockAvatars = [
    {
      imageUrl: "https://example.com/avatar1.png",
      profileUrl: "https://example.com/user1",
    },
    {
      imageUrl: "https://example.com/avatar2.png",
      profileUrl: "https://example.com/user2",
    },
  ]

  it("renders avatar images and links correctly", () => {
    render(<AvatarCircles avatarUrls={mockAvatars} />)

    const avatar1 = screen.getByAltText("Avatar 1")
    const avatar2 = screen.getByAltText("Avatar 2")

    expect(avatar1).toBeInTheDocument()
    expect(avatar1).toHaveAttribute("src", "https://example.com/avatar1.png")
    expect(avatar2).toBeInTheDocument()
    expect(avatar2).toHaveAttribute("src", "https://example.com/avatar2.png")
  })

  it("renders the remaining count badge when numPeople > 0", () => {
    render(<AvatarCircles avatarUrls={mockAvatars} numPeople={15} />)

    const badge = screen.getByText("+15")
    expect(badge).toBeInTheDocument()
  })

  it("does not render the remaining count badge when numPeople is 0 or undefined", () => {
    const { rerender } = render(<AvatarCircles avatarUrls={mockAvatars} numPeople={0} />)
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()

    rerender(<AvatarCircles avatarUrls={mockAvatars} />)
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  it("applies additional className", () => {
    const { container } = render(
      <AvatarCircles avatarUrls={mockAvatars} className="custom-test-class" />
    )
    expect(container.firstChild).toHaveClass("custom-test-class")
  })
})
