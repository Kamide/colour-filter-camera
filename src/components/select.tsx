import type { ComponentProps, FC, JSX } from "react";
import { supportsCustomizableSelect } from "../lib/css";
import { cn } from "../lib/tailwind";
import styles from "./select.module.css";

export type OptionValue = Exclude<
  ComponentProps<"option">["value"],
  readonly string[]
>;

export type OptionChildren<T> = FC<{
  option?: T;
  value?: OptionValue;
}>;

export type SelectProps<T> = Omit<
  ComponentProps<"select">,
  "value" | "onChange"
> & {
  options: T[];
  value?: T;
  onChange?: (option: T) => void;
  getOptionValue?: (option: T) => OptionValue;
  getOptionChildren?: OptionChildren<T>;
};

const defaultGetOptionValue = (option: unknown) =>
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  typeof option === "object" ? JSON.stringify(option) : String(option);

const defaultGetOptionChildren: OptionChildren<unknown> = ({ value }) => value;

export const Select = <T,>({
  options,
  getOptionValue = defaultGetOptionValue,
  getOptionChildren: Render = defaultGetOptionChildren,
  className,
  value,
  onChange,
  ref,
  ...props
}: SelectProps<T>) => {
  const valueToOptionMap = new Map<OptionValue, T>();
  const children: JSX.Element[] = [];

  for (const option of options) {
    const value = getOptionValue(option);

    valueToOptionMap.set(value, option);

    children.push(
      <option key={value} value={value}>
        <Render option={option} value={value} />
      </option>,
    );
  }

  // noinspection com.intellij.reactbuddy.ArrayToJSXMapInspection
  return (
    <select
      {...props}
      className={cn(styles.select, className)}
      value={value === undefined ? undefined : getOptionValue(value)}
      onChange={
        typeof onChange === "function"
          ? (event) => {
              onChange(valueToOptionMap.get(event.currentTarget.value)!);
            }
          : undefined
      }
      ref={
        supportsCustomizableSelect
          ? (select) => {
              const disposes: (() => void)[] = [];

              if (select != null) {
                const button = document.createElement("button");
                button.append(document.createElement("selectedcontent"));
                select.prepend(button);

                disposes.push(() => {
                  button.remove();
                });
              }

              if (typeof ref === "function") {
                const dispose = ref(select);

                if (typeof dispose === "function") {
                  disposes.push(dispose);
                }
              } else if (ref != null) {
                ref.current = select;
              }

              return () => {
                for (const dispose of disposes) {
                  dispose();
                }
              };
            }
          : ref
      }
    >
      {children}
    </select>
  );
};
