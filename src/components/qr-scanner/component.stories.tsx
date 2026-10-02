import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QrScanner } from './component';

const meta = {
  title: 'Components/qr-scanner',
  component: QrScanner,
  tags: ['autodocs'],
} satisfies Meta<typeof QrScanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
