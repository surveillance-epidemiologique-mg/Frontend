import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AuthShell } from './component';

const meta = {
  title: 'Components/auth-shell',
  component: AuthShell,
  tags: ['autodocs'],
} satisfies Meta<typeof AuthShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
