import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Textarea } from './component';

const meta = {
  title: 'Components/textarea',
  component: Textarea,
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
