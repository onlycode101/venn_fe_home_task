import { renderHook, act } from "@testing-library/react";
import useApi from "./useApi";

describe("useApi", () => {
  it("initializes state", () => {
    const { result } = renderHook(() => useApi(async () => "ok"));
    expect(result.current.status).toBe("not-started");
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it("shows pending", async () => {
    const apiFn = jest.fn().mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useApi(apiFn));

    await act(async () => {
      result.current.execute();
    });

    expect(result.current.status).toBe("pending");
    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("shows success", async () => {
    const apiFn = jest.fn().mockResolvedValue("100");
    const { result } = renderHook(() => useApi(apiFn));

    await act(async () => {
      result.current.execute();
    });

    expect(result.current.status).toBe("success");
    expect(result.current.data).toBe("100");
    expect(result.current.error).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it("shows error", async () => {
    const apiFn = jest.fn().mockRejectedValue("fail");
    const { result } = renderHook(() => useApi(apiFn));

    await act(async () => {
      await expect(result.current.execute()).rejects.toBe("fail");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("fail");
    expect(result.current.isPending).toBe(false);
  });

  it("resets state", async () => {
    const apiFn = jest.fn().mockResolvedValue("reset");
    const { result } = renderHook(() => useApi(apiFn));

    await act(async () => {
      await result.current.execute();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("not-started");
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isPending).toBe(false);
  });
});
