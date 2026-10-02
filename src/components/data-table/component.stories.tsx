import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DataTable } from './component';

const meta = {
  title: 'Components/data-table',
  component: DataTable,
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
