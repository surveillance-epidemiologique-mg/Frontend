import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EpidemicMap } from './EpidemicMap';

const meta = {
  title: 'Components/epidemic-map',
  component: EpidemicMap,
  tags: ['autodocs'],
} satisfies Meta<typeof EpidemicMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { canViewCaseLayers: true } };

