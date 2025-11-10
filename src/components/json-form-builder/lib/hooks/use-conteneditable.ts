import { useRef } from "react";

type Params = {
  onChange?: (val: string) => void;
  preventDefault?: boolean;
  innerText?: boolean;
};

const useContenteditable = ({ onChange, preventDefault, innerText }: Params) => {
  const ref = useRef<HTMLDivElement>(null);

  const onInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (preventDefault) {
      e.preventDefault();
    }
    if (e.currentTarget.textContent && !innerText) {
      onChange?.(e.currentTarget.textContent);
    } else if (e.currentTarget.innerText && innerText) {
      onChange?.(e.currentTarget.innerText);
    } else {
      // Clear the content if neither textContent nor innerText is available.
      e.currentTarget.innerHTML = "";
      onChange?.("");
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // if (preventDefault) {
    //   e.preventDefault();
    // }
    // Allow the paste event to complete, then trigger the onChange callback.
    setTimeout(() => {
      if (ref.current) {
        const value = innerText
          ? ref.current.innerText
          : ref.current.textContent;
        onChange?.(value || "");
      }
    }, 0);
  };

  return { ref, onInput, onPaste };
};

export default useContenteditable;
