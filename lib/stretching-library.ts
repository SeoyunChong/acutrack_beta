import type { WearLocation, StretchingExercise } from "./types";

export const stretchingLibrary: Record<WearLocation, StretchingExercise[]> = {
  wrist: [
    {
      id: "w1", title: "손목 굴곡근 스트레칭", targetArea: "wrist",
      purpose: "손목 앞쪽 근육 긴장을 줄이고 신전 움직임을 부드럽게 합니다.",
      instructionSteps: [
        "팔을 앞으로 뻗고 손바닥이 위를 향하게 합니다.",
        "반대쪽 손으로 손가락을 가볍게 아래로 당깁니다.",
        "손목 앞쪽이 당기는 느낌이 들면 15초 유지합니다.",
      ],
      holdSeconds: 15, repetitions: 3,
      cautions: ["저림이나 날카로운 통증이 있으면 중단하세요.", "강하게 꺾지 말고 가볍게 당기세요."],
      poseAngle: 35,
    },
    {
      id: "w2", title: "손목 신전근 스트레칭", targetArea: "wrist",
      purpose: "손목 뒤쪽 근육 긴장을 풀어주고 굴곡 범위를 늘립니다.",
      instructionSteps: [
        "팔을 앞으로 뻗고 손바닥이 아래를 향하게 합니다.",
        "반대쪽 손으로 손등을 아래로 가볍게 눌러줍니다.",
        "손목 뒤쪽이 당기는 느낌이 들면 15초 유지합니다.",
      ],
      holdSeconds: 15, repetitions: 3,
      cautions: ["무리하게 구부리지 마세요.", "통증이 심하면 즉시 중단하세요."],
      poseAngle: 55,
    },
  ],
  elbow: [
    {
      id: "e1", title: "팔꿈치 굴곡근 스트레칭", targetArea: "elbow",
      purpose: "위팔두갈래근(이두근, biceps brachii)과 전완 굴곡근의 긴장을 완화하고 신전 범위를 회복합니다.",
      instructionSteps: [
        "팔을 옆으로 뻗고 손바닥이 위를 향하게 합니다.",
        "반대쪽 손으로 손목 위를 가볍게 아래로 누릅니다.",
        "팔꿈치 앞쪽이 당기는 느낌이 들면 20초 유지합니다.",
      ],
      holdSeconds: 20, repetitions: 3,
      cautions: ["팔꿈치를 무리하게 펴지 마세요.", "저림 증상이 있으면 중단하세요."],
      poseAngle: 90,
    },
    {
      id: "e2", title: "전완 회전 스트레칭", targetArea: "elbow",
      purpose: "전완의 회내·회외 근육을 이완시켜 팔꿈치 동작을 원활하게 합니다.",
      instructionSteps: [
        "팔꿈치를 90도로 구부리고 옆구리에 붙입니다.",
        "천천히 손바닥을 위로 돌렸다가 아래로 돌립니다.",
        "각 방향에서 10초씩 유지하며 반복합니다.",
      ],
      holdSeconds: 10, repetitions: 5,
      cautions: ["통증 없이 부드럽게 움직이세요.", "강제로 회전시키지 마세요."],
      poseAngle: 130,
    },
  ],
  shoulder: [
    {
      id: "s1", title: "어깨 교차 스트레칭", targetArea: "shoulder",
      purpose: "후방 관절낭과 어깨세모근(삼각근, deltoid) 후방부를 이완하여 수평 내전(horizontal adduction) 범위를 개선합니다.",
      instructionSteps: [
        "한쪽 팔을 가슴 앞으로 교차시킵니다.",
        "반대쪽 팔로 팔꿈치를 몸쪽으로 부드럽게 당깁니다.",
        "어깨 뒤쪽이 당기는 느낌이 들면 20초 유지합니다.",
      ],
      holdSeconds: 20, repetitions: 3,
      cautions: ["어깨를 올리지 않도록 주의하세요.", "날카로운 통증이 있으면 멈추세요."],
      poseAngle: 60,
    },
    {
      id: "s2", title: "문틀 어깨 스트레칭", targetArea: "shoulder",
      purpose: "흉근과 전방 어깨 근육을 이완하여 외전 및 굴곡 범위를 넓힙니다.",
      instructionSteps: [
        "문틀 앞에 서서 팔을 90도로 들어 문틀에 댑니다.",
        "몸을 천천히 앞으로 기울이며 어깨 앞쪽이 늘어나게 합니다.",
        "어깨 앞쪽이 충분히 당기면 20초 유지합니다.",
      ],
      holdSeconds: 20, repetitions: 3,
      cautions: ["어깨 충돌 증후군이 있으면 주의하세요.", "통증이 심해지면 즉시 중단하세요."],
      poseAngle: 100,
    },
  ],
  neck: [
    {
      id: "n1", title: "경추 측면 스트레칭", targetArea: "neck",
      purpose: "목 옆쪽 근육(목빗근(흉쇄유돌근, sternocleidomastoid), 위등세모근(상부 승모근, upper trapezius))을 이완합니다.",
      instructionSteps: [
        "편안하게 앉아 허리를 곧게 펍니다.",
        "머리를 천천히 한쪽으로 기울여 귀가 어깨에 가까워지게 합니다.",
        "반대쪽 목이 당기는 느낌이 들면 15초 유지합니다.",
      ],
      holdSeconds: 15, repetitions: 3,
      cautions: ["머리를 뒤로 젖히지 마세요.", "어지럼증이 생기면 즉시 중단하세요."],
      poseAngle: 30,
    },
    {
      id: "n2", title: "경추 회전 스트레칭", targetArea: "neck",
      purpose: "경추 회전 근육의 긴장을 풀고 회전 범위를 회복합니다.",
      instructionSteps: [
        "앉거나 서서 어깨의 힘을 빼고 편안하게 시작합니다.",
        "천천히 고개를 한쪽으로 돌려 끝 범위에서 멈춥니다.",
        "10초 유지 후 반대방향으로 반복합니다.",
      ],
      holdSeconds: 10, repetitions: 5,
      cautions: ["급격히 돌리지 말고 천천히 움직이세요.", "저림이나 방사통이 있으면 중단하세요."],
      poseAngle: 45,
    },
  ],
  lowerBack: [
    {
      id: "lb1", title: "무릎 가슴 당기기", targetArea: "lowerBack",
      purpose: "요추 신전근과 둔근을 이완하여 허리 굴곡 범위를 개선합니다.",
      instructionSteps: [
        "바닥에 누워 무릎을 구부립니다.",
        "양 손으로 무릎을 가슴 쪽으로 천천히 당깁니다.",
        "허리 뒤쪽이 부드럽게 당기면 20초 유지합니다.",
      ],
      holdSeconds: 20, repetitions: 3,
      cautions: ["급격히 당기지 말고 부드럽게 진행하세요.", "허리에 날카로운 통증이 있으면 중단하세요."],
      poseAngle: 40,
    },
    {
      id: "lb2", title: "고양이-소 스트레칭", targetArea: "lowerBack",
      purpose: "척추 분절의 유연성을 높이고 요추 주변 근육을 이완합니다.",
      instructionSteps: [
        "네 발 자세(무릎과 손이 바닥에 닿는 자세)를 취합니다.",
        "숨을 들이마시며 허리를 아래로 내리고 머리를 들어 올립니다(소 자세).",
        "숨을 내쉬며 허리를 위로 올리고 머리를 내립니다(고양이 자세). 10회 반복합니다.",
      ],
      holdSeconds: 5, repetitions: 10,
      cautions: ["동작을 천천히 조절하며 진행하세요.", "급성 요통 시에는 시행하지 마세요."],
      poseAngle: 60,
    },
  ],
  knee: [
    {
      id: "k1", title: "대퇴사두근 스트레칭", targetArea: "knee",
      purpose: "넙다리네갈래근(대퇴사두근, quadriceps femoris)의 긴장을 풀어 무릎 굴곡 범위를 개선합니다.",
      instructionSteps: [
        "한 손으로 벽이나 의자를 잡고 균형을 유지합니다.",
        "같은 쪽 발목을 뒤에서 잡아 발뒤꿈치가 엉덩이에 가까워지게 당깁니다.",
        "허벅지 앞쪽이 당기는 느낌이 들면 20초 유지합니다.",
      ],
      holdSeconds: 20, repetitions: 3,
      cautions: ["무릎을 과도하게 구부리지 마세요.", "무릎 통증이 심해지면 중단하세요."],
      poseAngle: 70,
    },
    {
      id: "k2", title: "햄스트링 스트레칭", targetArea: "knee",
      purpose: "햄스트링 긴장을 완화하여 무릎 신전 시 당김을 줄입니다.",
      instructionSteps: [
        "바닥에 앉아 한 쪽 다리를 앞으로 뻗습니다.",
        "허리를 곧게 유지하며 뻗은 다리의 발끝 방향으로 상체를 앞으로 기울입니다.",
        "허벅지 뒤쪽이 당기는 느낌이 들면 20초 유지합니다.",
      ],
      holdSeconds: 20, repetitions: 3,
      cautions: ["허리를 구부리지 말고 엉덩이 관절에서 구부리세요.", "저림이 생기면 중단하세요."],
      poseAngle: 110,
    },
  ],
  ankle: [
    {
      id: "a1", title: "종아리 스트레칭", targetArea: "ankle",
      purpose: "장딴지근(비복근, gastrocnemius)과 가자미근을 이완하여 발목 배측굴곡(dorsiflexion) 범위를 개선합니다.",
      instructionSteps: [
        "벽 앞에 서서 한 발을 뒤로 크게 내딛습니다.",
        "뒷발 발꿈치는 바닥에 유지하고 앞 무릎을 구부리며 벽을 밀어냅니다.",
        "종아리가 당기는 느낌이 들면 20초 유지합니다.",
      ],
      holdSeconds: 20, repetitions: 3,
      cautions: ["발뒤꿈치가 바닥에서 떨어지지 않도록 하세요.", "통증이 있으면 강도를 줄이세요."],
      poseAngle: 20,
    },
    {
      id: "a2", title: "발목 원형 운동", targetArea: "ankle",
      purpose: "발목 관절 가동성을 전방향으로 증가시키고 배측굴곡(dorsiflexion) 및 저측굴곡(plantarflexion) 유연성을 유지합니다.",
      instructionSteps: [
        "의자에 앉아 한쪽 다리를 들어 올립니다.",
        "발목을 천천히 시계 방향으로 5회 돌립니다.",
        "반시계 방향으로 5회 더 돌립니다.",
      ],
      holdSeconds: 0, repetitions: 5,
      cautions: ["통증이 없는 범위에서만 움직이세요.", "부기가 있는 경우 의료진과 상담 후 시행하세요."],
      poseAngle: 35,
    },
  ],
};
