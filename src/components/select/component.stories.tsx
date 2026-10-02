import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Select } from './component';

const meta = {
  title: 'Components/select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Région',
    placeholder: 'Choisir une région',
    options: [
      { value: 'analamanga', label: 'Analamanga' },
      { value: 'boeny', label: 'Boeny' },
      { value: 'atsimo-andrefana', label: 'Atsimo-Andrefana' },
    ],
  },
};
