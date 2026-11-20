import { createContext, useContext } from "react";

// Sprint 2 contract — FormContext.
// Giá trị context: { values, errors, touched, handleChange, handleBlur }.
// Khởi tạo null để phát hiện việc dùng ngoài Provider.
export const FormContext = createContext(null);

// Custom hook bọc useContext: ném lỗi rõ ràng khi quên bọc <FormContext.Provider>,
// thay vì để component crash với "Cannot read properties of null".
export function useFormContext() {
  const ctx = useContext(FormContext);
  if (ctx === null) {
    throw new Error("useFormContext() phải được dùng bên trong <FormContext.Provider>.");
  }
  return ctx;
}
