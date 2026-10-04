import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Navbar } from "./component";

const meta = {
  title: "Components/navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: {
      name: "Aina Rakoto",
      email: "aina.rakoto@episuivi.mg",
      role: "Administrateur",
    },
    mobileOpen: false,
    onMenuClick: () => {},
  },
};
