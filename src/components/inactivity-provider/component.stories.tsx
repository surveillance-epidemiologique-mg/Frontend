import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { InactivityProvider } from './component';

const meta = {
  title: 'Components/inactivity-provider',
  component: InactivityProvider,
  tags: ['autodocs'],
} satisfies Meta<typeof InactivityProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
