/**
 * ============================================================================
 * LUCKY STEP — Modern Walking & Education Platform JavaScript
 * Interactive Features:
 *  1. Mobile Menu & Sticky Navigation
 *  2. Interactive Route & Step-to-KM/Meters Planner Calculator
 *  3. Stride Length Calibration & Scientific Transparency
 *  4. Dynamic SVG Route Path Transitions
 *  5. Curated Educational Podcast Player Simulator (Audio Visualizer & Playlist)
 *  6. Interactive Healthmaxxing Habit Checklist & Scoring
 *  7. Contact Form Validation with Accessible Feedback
 *  8. Bilingual Support (English / Georgian „ქართული“) Toggle
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initRoutePlanner();
  initFeatureWidgets();
  initPodcastPlayer();
  initHealthmaxxingWidget();
  initContactFormValidation();
  initLanguageToggle();
});

/* ==========================================================================
   1. NAVIGATION & HEADER BEHAVIOR
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('header');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');

  // Toggle mobile drawer
  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('open')) {
          mainNav.classList.remove('open');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (mainNav.classList.contains('open') && 
          !mainNav.contains(e.target) && 
          !mobileMenuBtn.contains(e.target)) {
        mainNav.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Header shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Scroll spy to highlight active section in navbar
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   2. INTERACTIVE ROUTE & STEP-TO-KM/METERS PLANNER
   ========================================================================== */
function initRoutePlanner() {
  // Form & inputs
  const stepGoalRange = document.getElementById('stepGoalRange');
  const stepGoalDisplay = document.getElementById('stepGoalDisplay');
  const startPointInput = document.getElementById('startPoint');
  const destPointInput = document.getElementById('destPoint');
  const calcRouteBtn = document.getElementById('calcRouteBtn');

  // Stride elements
  const strideAccordionBtn = document.getElementById('strideAccordionBtn');
  const strideConfigBody = document.getElementById('strideConfigBody');
  const currentStrideLabel = document.getElementById('currentStrideLabel');
  const customStrideVal = document.getElementById('customStrideVal');
  const strideSlider = document.getElementById('strideSlider');
  const stridePresetBtns = document.querySelectorAll('.stride-preset-btn');

  // Results elements
  const kpiDistKm = document.getElementById('kpiDistKm');
  const kpiDistMeters = document.getElementById('kpiDistMeters');
  const kpiTime = document.getElementById('kpiTime');
  const kpiCalories = document.getElementById('kpiCalories');
  const plannerSvgPath = document.getElementById('plannerSvgPath');
  const mapRouteTitle = document.getElementById('mapRouteTitle');
  const mapRouteStepsTag = document.getElementById('mapRouteStepsTag');

  // Hero synced elements
  const heroStepsDisplay = document.getElementById('heroStepsDisplay');
  const heroDistKm = document.getElementById('heroDistKm');
  const heroDistMeters = document.getElementById('heroDistMeters');
  const mockupStartVal = document.getElementById('mockupStartVal');
  const mockupEndVal = document.getElementById('mockupEndVal');

  // Quick Preset Chips
  const chipBtns = document.querySelectorAll('.chip-btn');
  chipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetVal = btn.getAttribute('data-val');
      const targetInput = document.getElementById(targetId);
      if (targetInput) {
        targetInput.value = targetVal;
        updatePlannerCalculations();
      }
    });
  });

  // Stride variables (standard average default is 0.76 meters)
  let currentStride = 0.76;
  const WALKING_SPEED_KMH = 5.0; // Average brisk walking pace 5.0 km/h

  // Toggle Stride Accordion
  if (strideAccordionBtn && strideConfigBody) {
    strideAccordionBtn.addEventListener('click', () => {
      const isExpanded = strideAccordionBtn.getAttribute('aria-expanded') === 'true';
      strideAccordionBtn.setAttribute('aria-expanded', !isExpanded);
      strideConfigBody.hidden = isExpanded;
    });
  }

  // Stride Preset Buttons
  stridePresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stridePresetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = parseFloat(btn.getAttribute('data-stride'));
      setStride(val);
    });
  });

  // Custom Stride Slider
  if (strideSlider) {
    strideSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      stridePresetBtns.forEach(b => b.classList.remove('active'));
      setStride(val);
    });
  }

  function setStride(val) {
    currentStride = val;
    if (strideSlider) strideSlider.value = val;
    if (customStrideVal) customStrideVal.textContent = `${val.toFixed(2)} m`;
    if (currentStrideLabel) {
      let desc = 'Standard';
      if (val < 0.72) desc = 'Shorter';
      else if (val > 0.80) desc = 'Taller';
      currentStrideLabel.textContent = `${val.toFixed(2)}m - ${desc}`;
    }
    updatePlannerCalculations();
  }

  // Step goal slider live change
  if (stepGoalRange) {
    stepGoalRange.addEventListener('input', () => {
      updatePlannerCalculations();
    });
  }

  // Core Math Calculation function
  function updatePlannerCalculations() {
    const steps = parseInt(stepGoalRange.value, 10);
    
    // Update step labels
    stepGoalDisplay.textContent = `${steps.toLocaleString()} steps`;
    mapRouteStepsTag.textContent = `${steps.toLocaleString()} Steps Target`;
    
    // Calculate distance in meters & kilometers
    // Distance (m) = steps * stride (m)
    const distanceMeters = Math.round(steps * currentStride);
    const distanceKm = (distanceMeters / 1000).toFixed(2);

    // Calculate walking time @ 5.0 km/h
    const totalMinutes = Math.round((distanceMeters / 1000 / WALKING_SPEED_KMH) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

    // Calculate estimated calories burned (average ~38 kcal per 1,000 steps)
    const calories = Math.round(steps * 0.038);

    // Update Result KPI Card elements
    kpiDistKm.innerHTML = `${distanceKm} <small>km</small>`;
    kpiDistMeters.textContent = `${distanceMeters.toLocaleString()} meters`;
    kpiTime.textContent = timeFormatted;
    kpiCalories.innerHTML = `~${calories} <small>kcal</small>`;

    // Sync with Hero Card elements for a unified feel
    if (heroStepsDisplay) heroStepsDisplay.textContent = steps.toLocaleString();
    if (heroDistKm) heroDistKm.textContent = distanceKm;
    if (heroDistMeters) heroDistMeters.textContent = `${distanceMeters.toLocaleString()} meters`;
    if (mockupStartVal && startPointInput) mockupStartVal.textContent = startPointInput.value || 'Current Location';
    if (mockupEndVal && destPointInput) mockupEndVal.textContent = destPointInput.value || 'Destination';
  }

  // Calculate / Refresh Button
  if (calcRouteBtn) {
    calcRouteBtn.addEventListener('click', () => {
      updatePlannerCalculations();
      animateSvgPath();
    });
  }

  // Route Variant Tabs (Scenic vs Urban vs Fitness)
  const variantBtns = document.querySelectorAll('.variant-btn');
  const routePaths = {
    scenic: 'M 50 175 C 90 90, 140 50, 210 90 C 270 120, 310 40, 420 70',
    urban: 'M 50 175 L 120 175 L 120 70 L 280 70 L 280 130 L 420 70',
    fitness: 'M 50 175 C 80 185, 120 140, 160 55 C 220 20, 260 180, 320 120 C 370 70, 390 110, 420 70'
  };

  const routeTitles = {
    scenic: 'Selected: Scenic Greenery Loop',
    urban: 'Selected: Cultural & Landmarks Loop',
    fitness: 'Selected: Gradient Hill Detour (High Burn)'
  };

  variantBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      variantBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const variant = btn.getAttribute('data-variant');
      if (plannerSvgPath && routePaths[variant]) {
        plannerSvgPath.setAttribute('d', routePaths[variant]);
        animateSvgPath();
      }
      if (mapRouteTitle && routeTitles[variant]) {
        mapRouteTitle.textContent = routeTitles[variant];
      }
    });
  });

  function animateSvgPath() {
    if (!plannerSvgPath) return;
    plannerSvgPath.style.strokeDashoffset = '600';
    requestAnimationFrame(() => {
      plannerSvgPath.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)';
      plannerSvgPath.style.strokeDashoffset = '0';
    });
  }

  // Initial calculation
  updatePlannerCalculations();
}

/* ==========================================================================
   3. FEATURE CARD 1: ROUTE PREVIEW SELECTOR WIDGET
   ========================================================================== */
function initFeatureWidgets() {
  const miniTabBtns = document.querySelectorAll('.mini-tab-btn');
  const featRouteName = document.getElementById('featRouteName');
  const featRouteKm = document.getElementById('featRouteKm');
  const featRouteM = document.getElementById('featRouteM');
  const featRouteSteps = document.getElementById('featRouteSteps');
  const featRouteMin = document.getElementById('featRouteMin');

  const routePresets = {
    standard: {
      name: 'Direct Commuter Corridor',
      km: '3.8 km',
      m: '(3,800 m)',
      steps: '~5,000 steps',
      time: '~45 min'
    },
    balanced: {
      name: 'Parkside Detour & Promenade',
      km: '5.4 km',
      m: '(5,400 m)',
      steps: '~7,100 steps',
      time: '~64 min'
    },
    extended: {
      name: 'Grand River & Hilltop Odyssey',
      km: '8.2 km',
      m: '(8,200 m)',
      steps: '~10,800 steps',
      time: '~98 min'
    }
  };

  miniTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      miniTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.getAttribute('data-route-type');
      const data = routePresets[type];

      if (data && featRouteName) {
        featRouteName.textContent = data.name;
        featRouteKm.textContent = data.km;
        featRouteM.textContent = data.m;
        featRouteSteps.textContent = data.steps;
        featRouteMin.textContent = data.time;
      }
    });
  });
}

/* ==========================================================================
   4. FEATURE CARD 2: CURATED PODCAST PLAYER SIMULATOR
   ========================================================================== */
function initPodcastPlayer() {
  const podPlayBtn = document.getElementById('podPlayBtn');
  const iconPlay = document.getElementById('iconPlay');
  const iconPause = document.getElementById('iconPause');
  const audioVisualizer = document.getElementById('audioVisualizer');
  const podProgressFill = document.getElementById('podProgressFill');
  const podCurrentTime = document.getElementById('podCurrentTime');
  const podTotalDuration = document.getElementById('podTotalDuration');
  const speedToggle = document.getElementById('speedToggle');
  const podChips = document.querySelectorAll('.pod-chip');

  // Metadata elements
  const podArtEmoji = document.getElementById('podArtEmoji');
  const podCategory = document.getElementById('podCategory');
  const podTitle = document.getElementById('podTitle');
  const podHost = document.getElementById('podHost');

  const podcastList = [
    {
      emoji: '🧬',
      category: 'Science & Physiology',
      title: 'The Biology of Walking & Deep Focus',
      host: 'Lucky Step Audio Lab • 24 min walk',
      duration: '24:00',
      totalSec: 1440,
      currentSec: 462
    },
    {
      emoji: '🚀',
      category: 'Tech & Future Systems',
      title: 'AI, Ambient Computing & Pedestrian Cities',
      host: 'Tomorrow Mind • 28 min walk',
      duration: '28:00',
      totalSec: 1680,
      currentSec: 320
    },
    {
      emoji: '🏛️',
      category: 'Philosophy & Stoicism',
      title: 'Solvitur Ambulando: Walking To Solve Problems',
      host: 'The Daily Thinker • 18 min walk',
      duration: '18:00',
      totalSec: 1080,
      currentSec: 190
    },
    {
      emoji: '🌿',
      category: 'Habits & Longevity',
      title: 'Zone 2 Movement: The Ultimate Habit Stack',
      host: 'Dr. Peter A. & Lucky Step • 32 min walk',
      duration: '32:00',
      totalSec: 1920,
      currentSec: 615
    }
  ];

  let currentPodIndex = 0;
  let isPlaying = false;
  let playInterval = null;
  let playbackSpeed = 1.0;

  // Format seconds to MM:SS
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Update Player UI with Active Podcast
  function loadPodcast(index) {
    currentPodIndex = index;
    const pod = podcastList[index];
    if (!pod) return;

    if (podArtEmoji) podArtEmoji.textContent = pod.emoji;
    if (podCategory) podCategory.textContent = pod.category;
    if (podTitle) podTitle.textContent = pod.title;
    if (podHost) podHost.textContent = pod.host;
    if (podTotalDuration) podTotalDuration.textContent = pod.duration;
    if (podCurrentTime) podCurrentTime.textContent = formatTime(pod.currentSec);

    const progressPct = ((pod.currentSec / pod.totalSec) * 100).toFixed(1);
    if (podProgressFill) podProgressFill.style.width = `${progressPct}%`;
  }

  // Play / Pause Simulation
  if (podPlayBtn) {
    podPlayBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        iconPlay.style.display = 'none';
        iconPause.style.display = 'block';
        if (audioVisualizer) audioVisualizer.classList.add('playing');

        // Increment time every second
        playInterval = setInterval(() => {
          const pod = podcastList[currentPodIndex];
          if (pod.currentSec < pod.totalSec) {
            pod.currentSec += playbackSpeed;
            if (podCurrentTime) podCurrentTime.textContent = formatTime(pod.currentSec);
            const pct = (pod.currentSec / pod.totalSec) * 100;
            if (podProgressFill) podProgressFill.style.width = `${pct}%`;
          } else {
            // Loop or reset
            pod.currentSec = 0;
          }
        }, 1000);
      } else {
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
        if (audioVisualizer) audioVisualizer.classList.remove('playing');
        clearInterval(playInterval);
      }
    });
  }

  // Category Switcher Chips
  podChips.forEach(chip => {
    chip.addEventListener('click', () => {
      podChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const idx = parseInt(chip.getAttribute('data-pod-index'), 10);
      loadPodcast(idx);
    });
  });

  // Speed Toggle (1.0x -> 1.25x -> 1.5x)
  if (speedToggle) {
    const speeds = [1.0, 1.25, 1.5];
    let speedIdx = 0;
    speedToggle.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      playbackSpeed = speeds[speedIdx];
      speedToggle.textContent = `${playbackSpeed.toFixed(1 === playbackSpeed ? 1 : 2)}x`;
    });
  }

  // Load first podcast
  loadPodcast(0);
}

/* ==========================================================================
   5. FEATURE CARD 3: HEALTHMAXXING CHECKLIST WIDGET
   ========================================================================== */
function initHealthmaxxingWidget() {
  const checkItems = document.querySelectorAll('.healthmax-checklist .check-item');
  const healthmaxScore = document.getElementById('healthmaxScore');

  checkItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('active');
      const activeCount = document.querySelectorAll('.healthmax-checklist .check-item.active').length;
      const totalCount = checkItems.length;
      if (healthmaxScore) {
        healthmaxScore.textContent = `${activeCount} / ${totalCount} Active`;
        healthmaxScore.style.background = activeCount === totalCount ? 'var(--primary-light)' : '#FEF3C7';
        healthmaxScore.style.color = activeCount === totalCount ? 'var(--primary-hover)' : '#B45309';
      }
    });
  });
}

/* ==========================================================================
   6. CONTACT FORM VALIDATION & USER FEEDBACK
   ========================================================================== */
function initContactFormValidation() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const messageInput = document.getElementById('contactMessage');
  const sendBtn = document.getElementById('sendMsgBtn');
  const sendBtnText = document.getElementById('sendBtnText');
  const feedbackAlert = document.getElementById('formFeedbackAlert');
  const feedbackText = document.getElementById('feedbackText');
  const feedbackIcon = document.getElementById('feedbackIcon');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');

  // Regex for RFC-compliant email checking
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validation functions
  function validateName() {
    const val = nameInput.value.trim();
    if (!val) {
      setError(nameInput, nameError, 'Please enter your name.');
      return false;
    }
    if (val.length < 2) {
      setError(nameInput, nameError, 'Name must be at least 2 characters long.');
      return false;
    }
    setValid(nameInput, nameError);
    return true;
  }

  function validateEmail() {
    const val = emailInput.value.trim();
    if (!val) {
      setError(emailInput, emailError, 'Email address is required.');
      return false;
    }
    if (!emailRegex.test(val)) {
      setError(emailInput, emailError, 'Please enter a valid email address (e.g. name@domain.com).');
      return false;
    }
    setValid(emailInput, emailError);
    return true;
  }

  function validateMessage() {
    const val = messageInput.value.trim();
    if (!val) {
      setError(messageInput, messageError, 'Please write a message.');
      return false;
    }
    if (val.length < 10) {
      setError(messageInput, messageError, 'Message must be at least 10 characters long.');
      return false;
    }
    setValid(messageInput, messageError);
    return true;
  }

  function setError(input, errorEl, msg) {
    input.classList.add('input-error');
    input.classList.remove('input-valid');
    if (errorEl) errorEl.textContent = msg;
  }

  function setValid(input, errorEl) {
    input.classList.remove('input-error');
    input.classList.add('input-valid');
    if (errorEl) errorEl.textContent = '';
  }

  // Live validation on blur
  nameInput.addEventListener('blur', validateName);
  emailInput.addEventListener('blur', validateEmail);
  messageInput.addEventListener('blur', validateMessage);

  // Clear error on input
  [nameInput, emailInput, messageInput].forEach(inp => {
    inp.addEventListener('input', () => {
      inp.classList.remove('input-error');
    });
  });

  // Handle Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    if (!isNameValid || !isEmailValid || !isMessageValid) {
      // Focus first erroneous field
      if (!isNameValid) nameInput.focus();
      else if (!isEmailValid) emailInput.focus();
      else if (!isMessageValid) messageInput.focus();
      return;
    }

    // Disable button and show sending feedback
    sendBtn.disabled = true;
    const originalText = sendBtnText.textContent;
    sendBtnText.textContent = 'Sending Message...';

    // Simulate backend submission without external dependency
    setTimeout(() => {
      const userName = nameInput.value.trim();
      
      // Show success alert
      feedbackAlert.hidden = false;
      feedbackAlert.className = 'form-feedback-alert success';
      feedbackIcon.textContent = '✓';
      feedbackText.innerHTML = `Thank you, <strong>${userName}</strong>! Your message has been received. Our team will get back to you shortly.`;

      // Reset form fields
      form.reset();
      [nameInput, emailInput, messageInput].forEach(inp => {
        inp.classList.remove('input-valid', 'input-error');
      });

      sendBtn.disabled = false;
      sendBtnText.textContent = originalText;

      // Auto-hide alert after 8 seconds
      setTimeout(() => {
        feedbackAlert.hidden = true;
      }, 8000);
    }, 700);
  });
}

/* ==========================================================================
   7. BILINGUAL SUPPORT (ENGLISH / GEORGIAN „ქართული“) TOGGLE
   ========================================================================== */
function initLanguageToggle() {
  const langToggle = document.getElementById('langToggle');
  const langFlag = document.getElementById('langFlag');
  const langLabel = document.getElementById('langLabel');

  let currentLang = 'en';

  const translations = {
    en: {
      nav_home: 'Home',
      nav_about: 'About Concept',
      nav_planner: 'Route Planner',
      nav_features: 'Features',
      nav_health: 'Health Benefits',
      nav_podcasts: 'Podcasts',
      nav_contact: 'Contact',
      btn_plan_my_walk: 'Plan My Walk',
      btn_learn_more: 'Explore How It Works',
      hero_badge: 'Smarter Daily Habits • Active Walking',
      hero_title_line: 'every step forward to self-growth',
      hero_subtitle: 'Lucky Step helps you plan walking routes tailored to your daily step goals, while discovering new places and learning on the go with curated educational podcasts.',
      metric_walks: 'Routes Optimized',
      metric_goal_hit: 'Daily Goals Achieved',
      metric_audio: 'Curated Audio Lessons',
      mockup_live_active: 'Active Route Simulation',
      mockup_tag_scenic: 'Scenic Green Path',
      label_start: 'Start point',
      label_destination: 'Destination',
      stat_daily_goal: 'Step Goal',
      unit_steps: 'steps',
      stat_est_distance: 'Est. Distance',
      stat_est_time: 'Est. Walk Time',
      unit_min: 'min',
      podcast_now_playing: 'Synced Audio Lesson',
      streak_healthmax: 'Consistent Habits',
      badge_stride_title: 'Stride Calibrated',
      badge_stride_sub: '0.76m avg. baseline',
      about_tag: 'About Lucky Step',
      about_title: 'Transforming Ordinary Commutes Into Empowering Journeys',
      about_desc: 'Standard navigation always forces the quickest, shortest commute. Lucky Step flips the script: enter where you are, where you want to go, and how many steps you wish to walk today. We design a smart, scenic route that fits your personal movement aspirations.',
      concept_step1_title: 'Enter Your Waypoints',
      concept_step1_text: 'Specify your starting location, final destination, and your target step goal (e.g. 5,000, 8,000, or 10,000+ steps).',
      concept_step2_title: 'Smart Route Generation',
      concept_step2_text: 'Our algorithm weaves through vibrant parks, pedestrian lanes, and scenic paths to match your daily step target accurately.',
      concept_step3_title: 'Walk, Learn & Thrive',
      concept_step3_text: 'Track your distance in kilometers and meters, listen to insightful audio tracks, and hit your self-growth objectives effortlessly.',
      disclaimer_title: 'Scientific Transparency: How Step Calculations Work',
      disclaimer_body: 'Individual Stride Length Matters: A human stride length is directly influenced by height, walking cadence, and terrain incline (typically varying between 0.65m and 0.85m). For this reason, distance and step predictions in Lucky Step are reliable mathematical estimates calibrated to an average stride length of 0.76 meters. You can fine-tune your custom stride length in our planner below for enhanced accuracy!',
      planner_badge: 'Interactive Sandbox',
      planner_tool_title: 'Plan Your Walking Route & Estimate Distance',
      planner_live_feedback: 'Real-time km & meter conversion',
      form_start_label: 'Starting Location',
      form_dest_label: 'Destination Location',
      form_steps_label: 'Target Daily Steps',
      stride_custom_title: 'Fine-tune Stride Length',
      stride_calc_hint: 'Average stride is roughly height × 0.415 for men and height × 0.413 for women. Adjust if you know your exact measurement:',
      btn_calc_route: '✨ Calculate My Custom Route',
      kpi_distance_km: 'Total Distance (km)',
      kpi_est_time: 'Estimated Time',
      kpi_energy: 'Energy Burn',
      kpi_pace_sub: 'Brisk 5 km/h walk',
      kpi_neat_sub: 'Metabolic NEAT burn',
      route_path_choice: 'Suggested Paths:',
      path_scenic: '🌿 Scenic Greenery Loop',
      path_urban: '🏛️ Cultural & Landmarks',
      path_fitness: '⚡ Gradient Hill Detour',
      planner_disclaimer_note: 'Estimated based on an average 0.76m stride length. Exact step count varies with your unique gait and elevation changes.',
      health_tag: 'Evidence-Based Wellness',
      health_title: 'The Proven Science of Regular Walking',
      health_desc: 'Walking is one of the most accessible, low-impact, and scientifically validated forms of preventive healthcare. Here is how daily purposeful steps elevate your longevity and mental performance.',
      health_card1_title: 'Cardiovascular Resilience',
      health_card1_text: 'Regular walking promotes arterial elasticity, lowers resting blood pressure, and significantly reduces long-term coronary risk through steady, sustained Zone 2 circulation.',
      health_card2_title: 'Cognitive Clarity & Neurogenesis',
      health_card2_text: 'Physical motion stimulates Brain-Derived Neurotrophic Factor (BDNF), enhancing memory consolidation, creative ideation, and mental resilience during stressful days.',
      health_card3_title: 'Natural Circadian Alignment',
      health_card3_text: 'Walking outdoors exposes your retinal ganglion cells to natural daylight, naturally timing cortisol release in the morning and promoting deep, restorative sleep at night.',
      health_card4_title: 'Metabolic Longevity & NEAT',
      health_card4_text: 'Non-Exercise Activity Thermogenesis (NEAT) accounts for the largest fraction of daily metabolic expenditure, supporting glucose regulation without the high cortisol spikes of extreme workouts.',
      features_tag: 'Platform Pillars',
      features_title: 'Engineered For Mindful Movement & Intellectual Growth',
      features_desc: 'Three core features thoughtfully built to help you reach your physical goals while enriching your mind every single day.',
      feature1_title: 'Proper Walking Routes',
      feature1_desc: 'Users simply enter their starting point, destination, and daily step goal. Lucky Step generates optimized walking routes with precise estimated distance in kilometers, meters, and expected step count.',
      tab_direct: 'Direct',
      tab_balanced: 'Balanced',
      tab_step_boost: 'Step Boost',
      detail_route_name: 'Suggested Path:',
      feature1_bullet: 'Sidewalk safety, green tree canopy, and low pollution scoring included.',
      feature2_title: 'Collect Knowledge While Walking',
      feature2_desc: 'Curated educational podcast recommendations and learning categories that sync directly with your walking duration. Feed your curiosity while stepping towards your daily movement milestone.',
      feature2_bullet: 'Episodes automatically suggested to match your route’s exact duration.',
      feature3_title: 'Walking + Healthmaxxing',
      feature3_desc: 'Educational insights into regular walking, daily movement optimization, and healthy habit architecture. Optimize posture, metabolic rate, and longevity without strenuous gym burnout.',
      healthmax_checklist_title: 'Daily Movement Multipliers',
      check1_title: 'Zone 2 Cardiovascular Base',
      check1_text: 'Sustained steady aerobic pace boosts mitochondrial efficiency.',
      check2_title: 'Circadian Sunlight Anchor',
      check2_text: '10–20 mins of natural light exposure anchors sleep latency.',
      check3_title: 'Zero-Impact Joint Decompression',
      check3_text: 'Promotes synovial fluid circulation with minimal spinal stress.',
      check4_title: 'Mental Reset & Cortisol Drain',
      check4_text: 'Bilateral visual stimulation gently calms the amygdala.',
      feature3_bullet: 'Compound habits: 7,500 daily steps equal over 2,700,000 steps annually.',
      contact_tag: 'Get In Touch',
      contact_title: 'Ready To Step Into Your Self-Growth?',
      contact_desc: 'Have questions about our step estimation algorithm, podcast suggestions, or partnership opportunities? Send us a message and our team will get back to you promptly.',
      contact_label_email: 'Direct Email',
      contact_label_loc: 'Headquarters',
      contact_label_community: 'Walker Community',
      faq_quick_title: 'Frequently Asked:',
      faq_q1: 'Q: Are step calculations exact?\nA: They are calibrated estimates (~0.76m stride standard) until you input your personal stride length.',
      form_name_label: 'Your Name',
      form_email_label: 'Email Address',
      form_msg_label: 'Message',
      btn_send_message: 'Send Message',
      privacy_note: '🔒 We respect your privacy. No spam, ever. Your information remains strictly confidential.',
      footer_motto: '“Every step forward to self-growth.” Helping conscious walkers hit daily movement goals and learn through tailored routes.',
      footer_links_title: 'Explore',
      footer_science_title: 'Transparency',
      footer_digest_title: 'Weekly Walkers Digest',
      footer_digest_desc: 'Fresh walking routes, cognitive podcasts, and longevity tips every Sunday.',
      footer_disclaimer: 'Disclaimer: Lucky Step provides calculated estimates for educational and recreational walking planning. Exact step counts vary by individual stride length and terrain. Always consult a medical professional before starting any intensive fitness regimen.'
    },
    ka: {
      nav_home: 'მთავარი',
      nav_about: 'ჩვენს შესახებ',
      nav_planner: 'მარშრუტის დაგეგმვა',
      nav_features: 'ფუნქციები',
      nav_health: 'ჯანმრთელობა',
      nav_podcasts: 'პოდკასტები',
      nav_contact: 'კონტაქტი',
      btn_plan_my_walk: 'Plan My Walk',
      btn_learn_more: 'გაიგე მეტი',
      hero_badge: 'ჯანსაღი ჩვევები • აქტიური სიარული',
      hero_title_line: 'every step forward to self-growth',
      hero_subtitle: 'Lucky Step გეხმარებათ დაგეგმოთ საფეხმავლო მარშრუტები, რომლებიც შეესაბამება თქვენს ყოველდღიურ ნაბიჯების მიზნებს, ამავდროულად აღმოაჩინოთ ახალი ადგილები და ისწავლოთ გზაში.',
      metric_walks: 'ოპტიმიზებული მარშრუტი',
      metric_goal_hit: 'მიღწეული მიზნები',
      metric_audio: 'აუდიო გაკვეთილი',
      mockup_live_active: 'აქტიური მარშრუტის სიმულაცია',
      mockup_tag_scenic: 'მწვანე ბუნებრივი ბილიკი',
      label_start: 'საწყისი წერტილი',
      label_destination: 'დანიშნულების ადგილი',
      stat_daily_goal: 'ნაბიჯების მიზანი',
      unit_steps: 'ნაბიჯი',
      stat_est_distance: 'სავარაუდო მანძილი',
      stat_est_time: 'სავარაუდო დრო',
      unit_min: 'წთ',
      podcast_now_playing: 'სინქრონიზებული პოდკასტი',
      streak_healthmax: 'უწყვეტი პროგრესი',
      badge_stride_title: 'ნაბიჯის კალიბრაცია',
      badge_stride_sub: '0.76მ საშუალო სიგრძე',
      about_tag: 'Lucky Step-ის შესახებ',
      about_title: 'ჩვეულებრივი გადაადგილების გარდაქმნა შთამაგონებელ მოგზაურობად',
      about_desc: 'ჩვეულებრივი ნავიგაცია ყოველთვის უმოკლეს გზას გვთავაზობს. Lucky Step კი სრულიად ცვლის ამ მიდგომას: შეიყვანეთ საწყისი მდებარეობა, დანიშნულების ადგილი და სასურველი ნაბიჯების რაოდენობა — ჩვენ კი შეგიდგენთ სასიამოვნო, მწვანე მარშრუტს თქვენი მიზნის მისაღწევად.',
      concept_step1_title: 'შეიყვანეთ წერტილები',
      concept_step1_text: 'მიუთითეთ საწყისი წერტილი, დანიშნულება და სასურველი ყოველდღიური ნაბიჯების მიზანი (მაგ. 5,000, 8,000 ან 10,000+).',
      concept_step2_title: 'ჭკვიანი მარშრუტირება',
      concept_step2_text: 'ალგორითმი ირჩევს პარკებს, საფეხმავლო ზონებსა და სუფთა ბილიკებს თქვენი მიზნის ზუსტად დასაფარად.',
      concept_step3_title: 'იარეთ, ისწავლეთ და განვითარდით',
      concept_step3_text: 'აკონტროლეთ მანძილი კილომეტრებსა და მეტრებში, მოუსმინეთ საგანმანათლებლო პოდკასტებს და მიაღწიეთ თვითგანვითარებას.',
      disclaimer_title: 'მეცნიერული სიზუსტე: როგორ ითვლება ნაბიჯები',
      disclaimer_body: 'ნაბიჯის სიგრძის მნიშვნელობა: ზუსტი ნაბიჯების რაოდენობა დამოკიდებულია მომხმარებლის ინდივიდუალურ ნაბიჯის სიგრძეზე, სიმაღლესა და რელიეფზე. ამიტომ შედეგი იქნება მიახლოებითი (დაფუძნებული საშუალო 0.76მ ნაბიჯის სიგრძეზე), თუ თქვენი ზუსტი პარამეტრი მითითებული არ არის. ქვემოთ შეგიძლიათ დააკონფიგურიროთ თქვენი ინდივიდუალური სიგრძე!',
      planner_badge: 'ინტერაქტიული ხელსაწყო',
      planner_tool_title: 'დაგეგმეთ საფეხმავლო მარშრუტი და გამოთვალეთ მანძილი',
      planner_live_feedback: 'კმ-ისა და მეტრების რეალურ დროში გაანგარიშება',
      form_start_label: 'საწყისი მდებარეობა',
      form_dest_label: 'დანიშნულების ადგილი',
      form_steps_label: 'სასურველი ნაბიჯების რაოდენობა',
      stride_custom_title: 'ნაბიჯის სიგრძის მორგება',
      stride_calc_hint: 'საშუალო ნაბიჯის სიგრძე შეადგენს სიმაღლის დაახლოებით 41.5%-ს. შეცვალეთ ზუსტი მონაცემებისთვის:',
      btn_calc_route: '✨ ჩემი მარშრუტის გამოთვლა',
      kpi_distance_km: 'სრული მანძილი (კმ)',
      kpi_est_time: 'სავარაუდო დრო',
      kpi_energy: 'ენერგიის ხარჯი',
      kpi_pace_sub: 'სწრაფი 5 კმ/სთ სიარული',
      kpi_neat_sub: 'მეტაბოლური NEAT ხარჯი',
      route_path_choice: 'შემოთავაზებული ბილიკები:',
      path_scenic: '🌿 მწვანე ბუნებრივი ბილიკი',
      path_urban: '🏛️ კულტურული & ღირსშესანიშნაობები',
      path_fitness: '⚡ აქტიური აღმართები',
      planner_disclaimer_note: 'გამოთვლილია საშუალო 0.76მ ნაბიჯის საფუძველზე. ზუსტი რაოდენობა დამოკიდებულია ინდივიდუალურ ნაბიჯის სიგრძეზე.',
      health_tag: 'ფაქტებზე დაფუძნებული ჯანმრთელობა',
      health_title: 'რეგულარული სიარულის მეცნიერული სარგებელი',
      health_desc: 'სიარული არის ერთ-ერთი ყველაზე ხელმისაწვდომი, სახსრებისთვის უსაფრთხო და კლინიკურად დადასტურებული პრევენციული მეთოდი ჯანმრთელობისა და გონებრივი ენერგიისთვის.',
      health_card1_title: 'გულ-სისხლძარღვთა ჯანმრთელობა',
      health_card1_text: 'რეგულარული სიარული აუმჯობესებს სისხლის მიმოქცევას, ამცირებს წნევას და 25–30%-ით ამცირებს გულის დაავადებების რისკს.',
      health_card2_title: 'გონებრივი სიცხადე და BDNF',
      health_card2_text: 'მოძრაობა ასტიმულირებს ნეიროტროფულ ფაქტორს (BDNF), აუმჯობესებს მეხსიერებას, კრეატიულობას და ამცირებს გონებრივ დაღლილობას.',
      health_card3_title: 'ცირკადული რიტმის რეგულაცია',
      health_card3_text: 'დღის სინათლეზე სიარული ასტაბილურებს კორტიზოლის დილის გამოყოფას და უზრუნველყოფს ღრმა, ხარისხიან ღამის ძილს.',
      health_card4_title: 'მეტაბოლიზმი და NEAT ენერგია',
      health_card4_text: 'ყოველდღიური არასავარჯიშო აქტივობა (NEAT) ხელს უწყობს გლუკოზის რეგულირებას ორგანიზმის ზედმეტი გადატვირთვის გარეშე.',
      features_tag: 'პლატფორმის შესაძლებლობები',
      features_title: 'შექმნილი გააზრებული მოძრაობისა და განათლებისთვის',
      features_desc: 'სამი მთავარი ფუნქცია, რომელიც შექმნილია თქვენი ფიზიკური მიზნებისა და ინტელექტუალური ზრდის დასაკავშირებლად.',
      feature1_title: 'Proper Walking Routes',
      feature1_desc: 'მომხმარებლებს შეუძლიათ შეიყვანონ საწყისი წერტილი, დანიშნულების ადგილი და ყოველდღიური ნაბიჯების მიზანი, რის შემდეგაც მიიღებენ შემოთავაზებულ საფეხმავლო მარშრუტს სავარაუდო მანძილისა და ნაბიჯების რაოდენობის მითითებით.',
      tab_direct: 'პირდაპირი',
      tab_balanced: 'ბალანსი',
      tab_step_boost: 'მეტი ნაბიჯი',
      detail_route_name: 'შემოთავაზებული გზა:',
      feature1_bullet: 'ითვალისწინებს უსაფრთხო ტროტუარებს, გამწვანებას და ჰაერის სისუფთავეს.',
      feature2_title: 'Collect Knowledge While Walking',
      feature2_desc: 'საგანმანათლებლო პოდკასტების რეკომენდაციები და კატეგორიები, რომელთა მოსმენაც შეგიძლიათ ზუსტად თქვენი სიარულის ხანგრძლივობის შესაბამისად.',
      feature2_bullet: 'ეპიზოდები ავტომატურად შეირჩევა თქვენი მარშრუტის დროის მიხედვით.',
      feature3_title: 'Walking + Healthmaxxing',
      feature3_desc: 'საგანმანათლებლო ინფორმაცია რეგულარული სიარულის, ყოველდღიური მოძრაობისა და ჯანსაღი ჩვევების სარგებლობის შესახებ.',
      healthmax_checklist_title: 'ყოველდღიური ჩვევების მულტიპლიკატორი',
      check1_title: 'Zone 2 აერობული ბაზა',
      check1_text: 'თანაბარი ტემპით სიარული აუმჯობესებს მიტოქონდრიების ეფექტურობას.',
      check2_title: 'ცირკადული მზის სინათლე',
      check2_text: '10–20 წუთი ბუნებრივი სინათლე აუმჯობესებს ძილის ხარისხს.',
      check3_title: 'სახსრების უსაფრთხო განტვირთვა',
      check3_text: 'ასტიმულირებს სასახსრე სითხეს ხერხემლის დატვირთვის გარეშე.',
      check4_title: 'სტრესის შემცირება & კორტიზოლის კლება',
      check4_text: 'ორმხრივი ვიზუალური სტიმულაცია ამშვიდებს ნერვულ სისტემას.',
      feature3_bullet: 'ყოველდღიური 7,500 ნაბიჯი წელიწადში 2,700,000-ზე მეტი ნაბიჯია.',
      contact_tag: 'დაგვიკავშირდით',
      contact_title: 'მზად ხართ გადადგათ ნაბიჯი თვითგანვითარებისკენ?',
      contact_desc: 'გაქვთ კითხვები ნაბიჯების გამოთვლასთან, პოდკასტებთან ან პარტნიორობასთან დაკავშირებით? მოგვწერეთ და ჩვენი გუნდი მალე გიპასუხებთ.',
      contact_label_email: 'ელფოსტა',
      contact_label_loc: 'ლოკაცია',
      contact_label_community: 'საზოგადოება',
      faq_quick_title: 'ხშირად დასმული კითხვა:',
      faq_q1: 'კ: არის თუ არა ნაბიჯების რაოდენობა ზუსტი?\nპ: შედეგი არის სავარაუდო (0.76მ საშუალო ნაბიჯზე), სანამ არ მიუთითებთ თქვენს ინდივიდუალურ ნაბიჯის სიგრძეს.',
      form_name_label: 'სახელი',
      form_email_label: 'ელფოსტა',
      form_msg_label: 'შეტყობინება',
      btn_send_message: 'Send Message',
      privacy_note: '🔒 თქვენი მონაცემები დაცულია და არ გადაეცემა მესამე პირებს.',
      footer_motto: '“every step forward to self-growth” — დაგეხმაროთ ყოველდღიური ნაბიჯების მიზნის მიღწევაში და ახლის შესწავლაში.',
      footer_links_title: 'ნავიგაცია',
      footer_science_title: 'გამჭვირვალობა',
      footer_digest_title: 'ყოველკვირეული დაიჯესტი',
      footer_digest_desc: 'ახალი მარშრუტები, საგანმანათლებლო პოდკასტები და ჯანმრთელობის რჩევები ყოველ კვირას.',
      footer_disclaimer: 'პასუხისმგებლობის უარყოფა: Lucky Step გთავაზობთ სავარაუდო გამოთვლებს საფეხმავლო მარშრუტების დაგეგმვისთვის. ზუსტი ნაბიჯების რაოდენობა დამოკიდებულია ინდივიდუალურ ნაბიჯის სიგრძეზე. ინტენსიური ფიზიკური აქტივობის დაწყებამდე გაიარეთ კონსულტაცია ექიმთან.'
    }
  };

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'ka' : 'en';

      if (currentLang === 'ka') {
        langFlag.textContent = '🇬🇧';
        langLabel.textContent = 'ENG';
      } else {
        langFlag.textContent = '🇬🇪';
        langLabel.textContent = 'ქარ';
      }

      applyTranslations(currentLang);
    });
  }

  function applyTranslations(lang) {
    const dict = translations[lang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        // If element has child elements with icons, replace only text or innerHTML
        if (el.children.length === 0 || el.classList.contains('section-title') || el.classList.contains('section-desc') || el.classList.contains('callout-desc')) {
          el.innerHTML = dict[key];
        } else {
          // Find first text node or span
          const textSpan = el.querySelector('span:not(.btn-arrow):not(.badge-pulse)');
          if (textSpan) {
            textSpan.textContent = dict[key];
          } else {
            el.childNodes.forEach(node => {
              if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                node.textContent = dict[key];
              }
            });
          }
        }
      }
    });

    // Update document title
    if (lang === 'ka') {
      document.title = 'Lucky Step — every step forward to self-growth';
    } else {
      document.title = 'Lucky Step — Every step forward to self-growth';
    }
  }
}
