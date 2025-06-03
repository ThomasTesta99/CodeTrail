export const QUESTIONS_PER_PAGE = 12;

export const sidebarLinks = [
    {
        imgUrl: '/assets/icons/dashboardIcon.svg',
        route: '/',
        label: 'Dashboard'
    },
    {
        imgUrl: '/assets/icons/listIcon.svg',
        route: '/all-questions',
        label: 'All Questions'
    },
    {
        imgUrl: '/assets/icons/plusIcon.svg',
        route: '/add-question',
        label: 'Add Question'
    },
]

export const fakeQuestions = [
  {
    id: 'q1',
    title: 'Two Sum',
    description: 'Find two numbers that add up to a target.',
    difficulty: 'Easy' as const,
    link: 'https://leetcode.com/problems/two-sum/',
    attempts: [
      {
        id: 'a1',
        solutionCode: `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`,
        language: 'javascript',
        neededHelp: false,
        durationMinutes: 20,
        notes: 'Brute force approach. O(n^2)',
        createdAt: '2025-05-28T10:00:00Z',
      },
      {
        id: 'a2',
        solutionCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
}`,
        language: 'javascript',  // <-- New!
        neededHelp: false,
        durationMinutes: 10,
        notes: 'Optimized with hashmap to O(n)',
        createdAt: '2025-05-29T09:00:00Z',
      }
    ],
    createdAt: '2025-05-27T09:00:00Z',
  },
  {
    id: 'q2',
    title: 'Reverse Linked List',
    description: 'Reverse a singly linked list.',
    difficulty: 'Medium' as const,
    link: 'https://leetcode.com/problems/reverse-linked-list/',
    attempts: [
      {
        id: 'a1',
        solutionCode: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
        
        language: 'javascript',  // <-- New!
        neededHelp: true,
        durationMinutes: 30,
        notes: 'Struggled with pointer reversal.',
        createdAt: '2025-05-28T11:00:00Z',
      },
      {
        id: 'a2',
        solutionCode: `function reverseListRecursive(head) {
  if (!head || !head.next) return head;
  const p = reverseListRecursive(head.next);
  head.next.next = head;
  head.next = null;
  return p;
}`,
        language: 'javascript',
        neededHelp: false,
        durationMinutes: 25,
        notes: 'Recursive approach implemented.',
        createdAt: '2025-05-30T14:00:00Z',
      }
    ],
    createdAt: '2025-05-27T10:00:00Z',
  },
  {
    id: 'q3',
    title: 'Valid Parentheses',
    description: 'Check for balanced parentheses.',
    difficulty: 'Easy' as const,
    link: 'https://leetcode.com/problems/valid-parentheses/',
    attempts: [
      {
        id: 'a1',
        solutionCode: `function isValid(s) {
  const stack = [];
  const map = { '(': ')', '{': '}', '[': ']' };
  for (let c of s) {
    if (map[c]) stack.push(map[c]);
    else if (stack.pop() !== c) return false;
  }
  return stack.length === 0;
}`,
        language: 'javascript',  // <-- New!
        neededHelp: false,
        durationMinutes: 15,
        notes: 'Stack-based approach works well.',
        createdAt: '2025-05-28T12:00:00Z',
      }
    ],
    createdAt: '2025-05-27T11:00:00Z',
  },
  {
    id: 'q4',
    title: 'Longest Substring Without Repeating Characters',
    description: 'Find the length of the longest substring.',
    difficulty: 'Medium' as const,
    link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    attempts: [
      {
        id: 'a1',
        solutionCode: `function lengthOfLongestSubstring(s) {
  let set = new Set();
  let left = 0, max = 0;
  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    max = Math.max(max, right - left + 1);
  }
  return max;
}`,
        language: 'javascript',  // <-- New!
        neededHelp: false,
        durationMinutes: 40,
        notes: 'Sliding window technique for O(n) solution.',
        createdAt: '2025-05-29T13:00:00Z',
      }
    ],
    createdAt: '2025-05-27T12:00:00Z',
  },
  {
    id: 'q5',
    title: 'Merge Intervals',
    description: 'Merge overlapping intervals.',
    difficulty: 'Hard' as const,
    link: 'https://leetcode.com/problems/merge-intervals/',
    attempts: [
      {
        id: 'a1',
        solutionCode: `function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = res[res.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      res.push(intervals[i]);
    }
  }
  return res;
}`,
        language: 'javascript',  // <-- New!
        neededHelp: true,
        durationMinutes: 60,
        notes: 'Sorting and merging with edge cases.',
        createdAt: '2025-05-30T14:00:00Z',
      }
    ],
    createdAt: '2025-05-27T13:00:00Z',
  },
  {
    id: 'q6',
    title: 'Container With Most Water',
    description: 'Find the max area of water a container can store.',
    difficulty: 'Medium' as const,
    link: 'https://leetcode.com/problems/container-with-most-water/',
    attempts: [
      {
        id: 'a1',
        solutionCode: `function maxArea(height) {
  let l = 0, r = height.length - 1, max = 0;
  while (l < r) {
    max = Math.max(max, Math.min(height[l], height[r]) * (r - l));
    if (height[l] < height[r]) l++; else r--;
  }
  return max;
}`,
        language: 'javascript',  // <-- New!
        neededHelp: false,
        durationMinutes: 35,
        notes: 'Two-pointer approach for optimal O(n) time.',
        createdAt: '2025-05-28T15:00:00Z',
      }
    ],
    createdAt: '2025-05-27T14:00:00Z',
  },
  {
    id: 'q7',
    title: 'Maximum Subarray',
    description: 'Find the contiguous subarray with the largest sum.',
    difficulty: 'Easy' as const,
    link: 'https://leetcode.com/problems/maximum-subarray/',
    attempts: [
      {
        id: 'a1',
        solutionCode: `function maxSubArray(nums) {
  let maxSum = nums[0], currSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currSum = Math.max(nums[i], currSum + nums[i]);
    maxSum = Math.max(maxSum, currSum);
  }
  return maxSum;
}`,
        language: 'javascript',  // <-- New!
        neededHelp: false,
        durationMinutes: 25,
        notes: 'Kadane\'s Algorithm for O(n) time.',
        createdAt: '2025-05-28T16:00:00Z',
      }
    ],
    createdAt: '2025-05-27T15:00:00Z',
  },
  {
    id: 'q8',
    title: 'Search in Rotated Sorted Array',
    description: 'Find a target in a rotated sorted array.',
    difficulty: 'Hard' as const,
    link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    attempts: [
      {
        id: 'a1',
        solutionCode: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) right = mid - 1;
      else left = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[right]) left = mid + 1;
      else right = mid - 1;
    }
  }
  return -1;
}`,
        language: 'javascript',  // <-- New!
        neededHelp: true,
        durationMinutes: 50,
        notes: 'Binary search with rotation pivot handling.',
        createdAt: '2025-05-28T17:00:00Z',
      }
    ],
    createdAt: '2025-05-27T16:00:00Z',
  }
];
