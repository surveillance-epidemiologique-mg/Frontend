import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Sidebar } from './component';

const meta = {
  title: 'Components/sidebar',
  component: Sidebar,
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
