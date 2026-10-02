import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ThemeProvider } from './component';

const meta = {
  title: 'Components/theme-provider',
  component: ThemeProvider,
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
