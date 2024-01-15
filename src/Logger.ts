export class Logger {
  public static log(message: string) {
    console.log("[LOG] - " + message);
  }

  public static error(message: string) {
    console.error("[ERROR] - " + message);
  }

  public static warn(message: string) {
    console.warn("[WARN] - " + message);
  }

  public static info(message: string) {
    console.info("[INFO] - " + message);
  }
}
