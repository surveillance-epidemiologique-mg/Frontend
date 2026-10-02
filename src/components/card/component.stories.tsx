import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Card } from './component';

const meta = {
  title: 'Components/card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
