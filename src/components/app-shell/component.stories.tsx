import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AppShell } from './component';

const meta = {
  title: 'Components/app-shell',
  component: AppShell,
  tags: ['autodocs'],
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
