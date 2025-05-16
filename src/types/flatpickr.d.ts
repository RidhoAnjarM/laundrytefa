// src/types/flatpickr.d.ts
import { ComponentType } from "react";

declare module "react-flatpickr" {
  interface FlatpickrProps {
    id?: string;
    className?: string;
    value?: string | Date | (string | Date)[];
    onChange?: (dates: Date[], dateStr: string, instance: any) => void;
    options?: {
      enableTime?: boolean;
      noCalendar?: boolean;
      dateFormat?: string;
      time_24hr?: boolean;
      minuteIncrement?: number;
      [key: string]: any;
    };
    placeholder?: string;
    required?: boolean;
    [key: string]: any;
  }

  const Flatpickr: ComponentType<FlatpickrProps>;
  export default Flatpickr;
}