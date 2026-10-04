import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Sidebar } from "./component";

const meta = {
  title: "Components/sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: {
      name: "Aina Rakoto",
      email: "aina.rakoto@episuivi.mg",
      role: "Administrateur",
    },
    role: "Administrateur",
    mobileOpen: false,
    onCloseMobile: () => {},
  },
};

export const MobileOpen: Story = {
  args: { ...Default.args, mobileOpen: true },
};
