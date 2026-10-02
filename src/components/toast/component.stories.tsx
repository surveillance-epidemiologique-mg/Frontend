import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ToastProvider } from './component';

const meta = {
  title: 'Components/toast',
  component: ToastProvider,
  tags: ['autodocs'],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
