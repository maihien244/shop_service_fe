export type ValidationResult = string | null | undefined | boolean;

export type ValidatorFunction<V, T = any> = (value: V, formValues: T) => ValidationResult | Promise<ValidationResult>;

/**
 * Kiểu dữ liệu quy định dạng validate cho một form.
 * Khi truyền một interface/type T vào, nó sẽ ánh xạ mỗi field của T 
 * thành một function để validate field đó.
 * 
 * Ví dụ:
 * interface LoginForm {
 *   username: string;
 *   password: number;
 * }
 * 
 * const loginValidate: AbstractForm<LoginForm> = {
 *   username: (val, form) => val.length > 0 ? null : "Username is required",
 *   password: (val) => val > 6 ? null : "Password must be > 6"
 * }
 */
export type AbstractForm<T> = {
  [K in keyof T]?: ValidatorFunction<T[K], T>;
};