import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SettingsPage } from './component';

const meta = {
  title: 'Components/settings-page',
  component: SettingsPage,
  tags: ['autodocs'],
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
