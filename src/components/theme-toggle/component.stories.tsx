import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ThemeToggle } from './component';

const meta = {
  title: 'Components/theme-toggle',
  component: ThemeToggle,
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
