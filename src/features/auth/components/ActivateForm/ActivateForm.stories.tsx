import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ActivateForm } from './ActivateForm';

const meta = {
  title: 'Components/activate-form',
  component: ActivateForm,
  tags: ['autodocs'],
} satisfies Meta<typeof ActivateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

