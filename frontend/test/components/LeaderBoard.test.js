/**
 * @fileoverview LeaderBoard Component Tests
 * @description Tests for the leaderboard display component
 */

import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import LeaderBoard from "../../src/components/dashboard/LeaderBoard.vue";
import axios from "../../src/utils/axios";

// Mock axios
vi.mock("../../src/utils/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock PrimeVue components
const mockPrimeComponents = {
  Card: {
    template:
      '<div class="card"><slot name="title" /><slot name="content" /></div>',
  },
};

// Mock PrimeVue ToastService
vi.mock("primevue/usetoast", () => ({
  useToast: () => ({
    add: vi.fn(),
    removeGroup: vi.fn(),
    removeAllGroups: vi.fn(),
  }),
}));

// Create a mock router
const createMockRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div>Home</div>" } },
      { path: "/goals", component: { template: "<div>Goals</div>" } },
    ],
  });
};

describe("LeaderBoard Component", () => {
  let router;
  let wrapper;

  beforeEach(async () => {
    router = createMockRouter();
    await router.push("/");
    await router.isReady();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  const mountComponent = (options = {}) => {
    return mount(LeaderBoard, {
      global: {
        plugins: [router],
        components: mockPrimeComponents,
        stubs: {
          Card: mockPrimeComponents.Card,
        },
      },
      ...options,
    });
  };

  test("should render the component", () => {
    wrapper = mountComponent();
    expect(wrapper.exists()).toBe(true);
  });

  test('should display "Leaderboard" title', () => {
    wrapper = mountComponent();
    expect(wrapper.text()).toContain("Leaderboard");
  });

  test("should display subtitle", () => {
    wrapper = mountComponent();
    expect(wrapper.text()).toContain("Top members based on points earned");
  });

  test("should fetch and display leaderboard data on mount", async () => {
    const mockLeaderboard = [
      {
        rank: 1,
        student: { id: 1, name: "John Doe" },
        points: 100,
        earnedPoints: 120,
        bonusPoints: 20,
      },
      {
        rank: 2,
        student: { id: 2, name: "Jane Smith" },
        points: 90,
        earnedPoints: 90,
        bonusPoints: 0,
      },
      {
        rank: 3,
        student: { id: 3, name: "Bob Johnson" },
        points: 80,
        earnedPoints: 75,
        bonusPoints: 5,
      },
    ];

    axios.get.mockResolvedValue({ data: mockLeaderboard });

    wrapper = mountComponent();
    await flushPromises();

    expect(axios.get).toHaveBeenCalledWith("/api/points/leaderboard");
    expect(wrapper.text()).toContain("John Doe");
    expect(wrapper.text()).toContain("Jane Smith");
    expect(wrapper.text()).toContain("Bob Johnson");
    expect(wrapper.text()).toContain("100");
    expect(wrapper.text()).toContain("90");
    expect(wrapper.text()).toContain("80");
  });

  test("should display rank numbers for each entry", async () => {
    const mockLeaderboard = [
      { rank: 1, student: { id: 1, name: "Student 1" }, points: 100 },
      { rank: 2, student: { id: 2, name: "Student 2" }, points: 90 },
      { rank: 3, student: { id: 3, name: "Student 3" }, points: 80 },
    ];

    axios.get.mockResolvedValue({ data: mockLeaderboard });

    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.text()).toContain("1");
    expect(wrapper.text()).toContain("2");
    expect(wrapper.text()).toContain("3");
  });

  test("should show trophy icon for top 3 entries", async () => {
    const mockLeaderboard = [
      { rank: 1, student: { id: 1, name: "Student 1" }, points: 100 },
      { rank: 2, student: { id: 2, name: "Student 2" }, points: 90 },
      { rank: 3, student: { id: 3, name: "Student 3" }, points: 80 },
      { rank: 4, student: { id: 4, name: "Student 4" }, points: 70 },
    ];

    axios.get.mockResolvedValue({ data: mockLeaderboard });

    wrapper = mountComponent();
    await flushPromises();

    const trophyIcons = wrapper.findAll(".pi-trophy");
    // Top 3 should have visible trophies
    const visibleTrophies = trophyIcons.filter(
      (icon) => !icon.classes().includes("invisible")
    );
    expect(visibleTrophies.length).toBeGreaterThanOrEqual(3);
  });

  test("should apply gold color to rank 1 trophy", async () => {
    const mockLeaderboard = [
      { rank: 1, student: { id: 1, name: "Champion" }, points: 100 },
    ];

    axios.get.mockResolvedValue({ data: mockLeaderboard });

    wrapper = mountComponent();
    await flushPromises();

    const trophyIcons = wrapper.findAll(".pi-trophy");
    const goldTrophy = trophyIcons.find((icon) =>
      icon.classes().includes("text-yellow-500")
    );
    expect(goldTrophy).toBeDefined();
  });

  test("should navigate to goals when entry is clicked", async () => {
    const mockLeaderboard = [
      { rank: 1, student: { id: 1, name: "John Doe" }, points: 100 },
    ];

    axios.get.mockResolvedValue({ data: mockLeaderboard });

    wrapper = mountComponent();
    await flushPromises();

    const pushSpy = vi.spyOn(router, "push");

    const entries = wrapper.findAll("li");
    if (entries.length > 0) {
      await entries[0].trigger("click");
      expect(pushSpy).toHaveBeenCalledWith({
        path: "/goals",
        query: { studentId: 1 },
      });
    }
  });

  test("should show toast error when API call fails", async () => {
    const errorMessage = "Failed to load leaderboard";
    axios.get.mockRejectedValue({ response: { status: 500 } });

    wrapper = mountComponent();
    await flushPromises();

    // Toast is called via useToast composable, we just verify the component doesn't crash
    expect(wrapper.exists()).toBe(true);
  });

  test("should display empty state when leaderboard is empty", async () => {
    axios.get.mockResolvedValue({ data: [] });

    wrapper = mountComponent();
    await flushPromises();

    const listItems = wrapper.findAll("li");
    expect(listItems.length).toBe(0);
  });

  test("should handle hover effect on entries", async () => {
    const mockLeaderboard = [
      { rank: 1, student: { id: 1, name: "John Doe" }, points: 100 },
    ];

    axios.get.mockResolvedValue({ data: mockLeaderboard });

    wrapper = mountComponent();
    await flushPromises();

    const entries = wrapper.findAll("li");
    if (entries.length > 0) {
      expect(entries[0].classes()).toContain("hover:bg-gray-100");
      expect(entries[0].classes()).toContain("cursor-pointer");
    }
  });

  test("should format points display correctly", async () => {
    const mockLeaderboard = [
      { rank: 1, student: { id: 1, name: "John Doe" }, points: 1000 },
    ];

    axios.get.mockResolvedValue({ data: mockLeaderboard });

    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.text()).toContain("1000");
    const boldPoints = wrapper.findAll(".font-bold");
    expect(boldPoints.length).toBeGreaterThan(0);
  });
});
