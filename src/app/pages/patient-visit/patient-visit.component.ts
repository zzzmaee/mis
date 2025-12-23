import { CommonModule, isPlatformBrowser, DOCUMENT } from "@angular/common";
import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NzTimelineModule } from "ng-zorro-antd/timeline";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzAlertModule } from "ng-zorro-antd/alert";
import { NzInputNumberModule } from "ng-zorro-antd/input-number";
import { NzDividerModule } from "ng-zorro-antd/divider";
import { NzDescriptionsModule } from "ng-zorro-antd/descriptions";
import { NzMessageModule, NzMessageService } from "ng-zorro-antd/message";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import { NzModalModule } from "ng-zorro-antd/modal";
import { Inject, PLATFORM_ID } from "@angular/core";
import {JitsiService} from '../../shared/services/jitsi.service';

type RiskLevel = "low" | "medium" | "high";

type AiImpactLevel = "high" | "medium" | "low";

interface SelectOption {
  value: string;
  label: string;
}

interface PatientProfile {
  id: string;
  fullName: string;
  birthDate: Date;
  contactPhone: string;
  email: string;
  iin: string;
  department: string;
  position: string;
  personnelNumber: string;
  attendingDoctor: string;
  lastVisit: Date;
  nextVisit: Date;
  riskFactors: string[];
  photo: string;
}

interface PatientVisitTimelineEvent {
  date: Date;
  title: string;
  details: string;
  color: "blue" | "green" | "red";
}

interface PatientVisitFormValue {
  history: {
    chronicDiseases: string[];
    allergies: string[];
    medications: string[];
    surgeries: string[];
    historyNotes: string;
  };
  current: {
    complaints: string;
    objectiveStatus: string;
    diagnosis: string;
    treatmentPlan: string;
    recommendations: string;
    vitals: {
      temperature: number;
      pulse: number;
      systolic: number;
      diastolic: number;
      spo2: number;
      respiratoryRate: number;
    };
  };
  lifestyle: {
    activityLevel: string;
    sleepQuality: string;
    stressLevel: string;
    nutrition: string;
  };
}

interface VitalMetricConfig {
  control: keyof PatientVisitFormValue["current"]["vitals"];
  unit: string;
  step: number;
  min: number;
  max: number;
  labelKey: string;
}

interface AiTrigger {
  labelKey: string;
  detailKey: string;
  impact: AiImpactLevel;
}

interface AiFollowUp {
  titleKey: string;
  dueKey: string;
}

interface AiAnalysis {
  assistantName: string;
  updatedAt: Date;
  riskScore: number;
  riskLevel: RiskLevel;
  summaryKey: string;
  triggers: AiTrigger[];
  recommendations: string[];
  followUps: AiFollowUp[];
}

type TelemedStatus = "scheduled" | "live" | "ended";

interface TelemedSession {
  id: string;
  status: TelemedStatus;
  platform: string;
  scheduledAt: Date;
  durationMinutes: number;
  channel: string;
  pin: string;
  doctorSide: string;
  patientSide: string;
  paramedicName: string;
  device: string;
  noteKey: string;
}

@Component({
  selector: "app-patient-visit",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    NzCardModule,
    NzAvatarModule,
    NzTagModule,
    NzTimelineModule,
    NzSelectModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule,
    NzInputNumberModule,
    NzDividerModule,
    NzDescriptionsModule,
    NzMessageModule,
    NzFormModule,
    NzIconModule,
    NzToolTipModule,
    NzModalModule,
  ],
  templateUrl: "./patient-visit.component.html",
  styleUrl: "./patient-visit.component.less",
})
export class PatientVisitComponent implements OnInit, OnDestroy {
  @ViewChild("jitsiContainer") jitsiContainer?: ElementRef<HTMLDivElement>;
  readonly visitForm: FormGroup;
  lastSavedAt: Date | null = null;
  isSaving = false;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private jitsiApi: any = null;
  showTelemedCall = false;
  isTelemedModalVisible = false;
  private readonly jitsiDomain = "jitsi-meet.yurtech.kz";
  jitsiReady = false;
  isMicMuted = false;
  isVideoMuted = false;
  isFullscreen = false;

  private fullscreenHandler = () => {
    const nativeFullscreen =
      this.document.fullscreenElement ||
      (this.document as any).webkitFullscreenElement ||
      (this.document as any).mozFullScreenElement;
    if (!nativeFullscreen) {
      this.isFullscreen = false;
    }
  };

  readonly patientProfile: PatientProfile = {
    id: "patient-1223",
    fullName: "Жумабекова Айгуль Ерлановна",
    birthDate: new Date("1986-04-12"),
    contactPhone: "+7 701 222 33 44",
    email: "a.zhumabekova@example.com",
    iin: "860412300123",
    department: "Производство / Цех №4",
    position: "Мастер смены",
    personnelNumber: "004512",
    attendingDoctor: "Д-р А. Сагындык",
    lastVisit: new Date("2024-11-22T09:40:00"),
    nextVisit: new Date("2025-01-15T09:00:00"),
    riskFactors: ["Гипертония II ст.", "Сидячая работа", "Низкая активность"],
    photo: "assets/avatars/10-3.jpg",
  };

  readonly visitTimeline: PatientVisitTimelineEvent[] = [
    {
      date: new Date("2024-11-22T09:40:00"),
      title: "Контрольное обследование",
      details: "АД 138/86, нормализация сахара после корректировки терапии.",
      color: "blue",
    },
    {
      date: new Date("2024-10-08T08:50:00"),
      title: "Жалобы на головные боли",
      details:
        "Повышенное давление после ночной смены, назначено дообследование.",
      color: "red",
    },
    {
      date: new Date("2024-08-19T10:15:00"),
      title: "Плановый профосмотр",
      details: "Без жалоб, рекомендована ходьба не менее 6 000 шагов в день.",
      color: "green",
    },
  ];

  readonly chronicDiseaseOptions: SelectOption[] = [
    {
      value: "hypertension",
      label: "medicalData.patientVisit.history.diseases.hypertension",
    },
    {
      value: "diabetes",
      label: "medicalData.patientVisit.history.diseases.diabetes",
    },
    {
      value: "asthma",
      label: "medicalData.patientVisit.history.diseases.asthma",
    },
    {
      value: "ibs",
      label: "medicalData.patientVisit.history.diseases.ibs",
    },
    {
      value: "osteochondrosis",
      label: "medicalData.patientVisit.history.diseases.osteochondrosis",
    },
  ];

  readonly allergyOptions: SelectOption[] = [
    {
      value: "penicillin",
      label: "medicalData.patientVisit.history.allergiesOptions.penicillin",
    },
    {
      value: "nsaids",
      label: "medicalData.patientVisit.history.allergiesOptions.nsaids",
    },
    {
      value: "seasonal",
      label: "medicalData.patientVisit.history.allergiesOptions.seasonal",
    },
  ];

  readonly medicationOptions: SelectOption[] = [
    {
      value: "enalapril",
      label: "medicalData.patientVisit.history.medicationsOptions.enalapril",
    },
    {
      value: "metformin",
      label: "medicalData.patientVisit.history.medicationsOptions.metformin",
    },
    {
      value: "atorvastatin",
      label: "medicalData.patientVisit.history.medicationsOptions.atorvastatin",
    },
  ];

  readonly surgeryOptions: SelectOption[] = [
    {
      value: "appendectomy_2010",
      label: "medicalData.patientVisit.history.surgeriesOptions.appendectomy",
    },
    {
      value: "cholecystectomy_2018",
      label:
        "medicalData.patientVisit.history.surgeriesOptions.cholecystectomy",
    },
    {
      value: "none",
      label: "medicalData.patientVisit.history.surgeriesOptions.none",
    },
  ];

  readonly activityOptions: SelectOption[] = [
    {
      value: "low",
      label: "medicalData.patientVisit.lifestyle.activityOptions.low",
    },
    {
      value: "moderate",
      label: "medicalData.patientVisit.lifestyle.activityOptions.moderate",
    },
    {
      value: "high",
      label: "medicalData.patientVisit.lifestyle.activityOptions.high",
    },
  ];

  readonly sleepOptions: SelectOption[] = [
    {
      value: "unstable",
      label: "medicalData.patientVisit.lifestyle.sleepOptions.unstable",
    },
    {
      value: "stable",
      label: "medicalData.patientVisit.lifestyle.sleepOptions.stable",
    },
    {
      value: "insomnia",
      label: "medicalData.patientVisit.lifestyle.sleepOptions.insomnia",
    },
  ];

  readonly stressOptions: SelectOption[] = [
    {
      value: "low",
      label: "medicalData.patientVisit.lifestyle.stressOptions.low",
    },
    {
      value: "medium",
      label: "medicalData.patientVisit.lifestyle.stressOptions.medium",
    },
    {
      value: "high",
      label: "medicalData.patientVisit.lifestyle.stressOptions.high",
    },
  ];

  readonly nutritionOptions: SelectOption[] = [
    {
      value: "balanced",
      label: "medicalData.patientVisit.lifestyle.nutritionOptions.balanced",
    },
    {
      value: "irregular",
      label: "medicalData.patientVisit.lifestyle.nutritionOptions.irregular",
    },
    {
      value: "highSugar",
      label: "medicalData.patientVisit.lifestyle.nutritionOptions.highSugar",
    },
  ];

  readonly historyTemplates: string[] = [
    "Хронические заболевания компенсированы, эпизодических кризов не отмечает.",
    "Сезонная аллергия на цветение, использует антигистаминные по необходимости.",
  ];

  readonly complaintTemplates: string[] = [
    "Пульсирующие головные боли после ночной смены, слабость, утомляемость.",
    "Головокружение при резком вставании, эпизоды онемения пальцев.",
  ];

  readonly objectiveTemplates: string[] = [
    "Сознание ясное, кожа чистая, отеков нет. Тоны сердца приглушены, хрипов нет.",
    "Легкая пастозность голеней, дыхание везикулярное, живот мягкий безболезненный.",
  ];

  readonly planTemplates: string[] = [
    "Скорректировать дозу Эналаприла до 10 мг 2 раза в сутки, контроль через 2 недели.",
    "Добавить дневные прогулки не менее 20 минут, вести дневник давления.",
  ];

  readonly vitalsConfig: VitalMetricConfig[] = [
    {
      control: "temperature",
      unit: "°C",
      step: 0.1,
      min: 34,
      max: 42,
      labelKey: "medicalData.patientVisit.vitals.temperature",
    },
    {
      control: "pulse",
      unit: "уд/мин",
      step: 1,
      min: 30,
      max: 220,
      labelKey: "medicalData.patientVisit.vitals.pulse",
    },
    {
      control: "systolic",
      unit: "мм рт. ст.",
      step: 1,
      min: 60,
      max: 260,
      labelKey: "medicalData.patientVisit.vitals.systolic",
    },
    {
      control: "diastolic",
      unit: "мм рт. ст.",
      step: 1,
      min: 30,
      max: 180,
      labelKey: "medicalData.patientVisit.vitals.diastolic",
    },
    {
      control: "spo2",
      unit: "%",
      step: 1,
      min: 70,
      max: 100,
      labelKey: "medicalData.patientVisit.vitals.spo2",
    },
    {
      control: "respiratoryRate",
      unit: "вдох/мин",
      step: 1,
      min: 8,
      max: 40,
      labelKey: "medicalData.patientVisit.vitals.respiratory",
    },
  ];

  readonly aiAnalysis: AiAnalysis = {
    assistantName: "MED-Assist",
    updatedAt: new Date("2024-11-22T10:05:00"),
    riskScore: 72,
    riskLevel: "medium",
    summaryKey: "medicalData.patientVisit.ai.summary",
    triggers: [
      {
        labelKey: "medicalData.patientVisit.ai.triggers.bloodPressure",
        detailKey: "medicalData.patientVisit.ai.triggers.bloodPressureHint",
        impact: "high",
      },
      {
        labelKey: "medicalData.patientVisit.ai.triggers.sleepDebt",
        detailKey: "medicalData.patientVisit.ai.triggers.sleepDebtHint",
        impact: "medium",
      },
      {
        labelKey: "medicalData.patientVisit.ai.triggers.activity",
        detailKey: "medicalData.patientVisit.ai.triggers.activityHint",
        impact: "medium",
      },
    ],
    recommendations: [
      "medicalData.patientVisit.ai.recommendations.medication",
      "medicalData.patientVisit.ai.recommendations.monitoring",
      "medicalData.patientVisit.ai.recommendations.lifestyle",
    ],
    followUps: [
      {
        titleKey: "medicalData.patientVisit.ai.followups.abpm",
        dueKey: "medicalData.patientVisit.ai.followups.abpmDue",
      },
      {
        titleKey: "medicalData.patientVisit.ai.followups.biochemistry",
        dueKey: "medicalData.patientVisit.ai.followups.biochemistryDue",
      },
      {
        titleKey: "medicalData.patientVisit.ai.followups.consult",
        dueKey: "medicalData.patientVisit.ai.followups.consultDue",
      },
    ],
  };

  readonly telemedSession: TelemedSession = {
    id: "tm-9082",
    status: "scheduled",
    platform: "MED Telemed",
    scheduledAt: new Date("2024-11-22T10:30:00"),
    durationMinutes: 30,
    channel: "Room 4B · Камера 02",
    pin: "483-221",
    doctorSide: "Д-р А. Сагындык",
    patientSide: "Цех №4 · пост 12",
    paramedicName: "Фельдшер С. Абдурахман",
    device: "Samsung Tab Active 4",
    noteKey: "medicalData.patientVisit.telemed.note",
  };

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private translate: TranslateService,
    private jitsiService: JitsiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
  ) {
    const initialValue = this.getInitialFormValue();
    this.visitForm = this.fb.group({
      history: this.fb.group({
        chronicDiseases: [initialValue.history.chronicDiseases],
        allergies: [initialValue.history.allergies],
        medications: [initialValue.history.medications],
        surgeries: [initialValue.history.surgeries],
        historyNotes: [
          initialValue.history.historyNotes,
          [Validators.required, Validators.minLength(8)],
        ],
      }),
      current: this.fb.group({
        complaints: [
          initialValue.current.complaints,
          [Validators.required, Validators.minLength(6)],
        ],
        objectiveStatus: [
          initialValue.current.objectiveStatus,
          [Validators.required, Validators.minLength(6)],
        ],
        diagnosis: [
          initialValue.current.diagnosis,
          [Validators.required, Validators.minLength(4)],
        ],
        treatmentPlan: [
          initialValue.current.treatmentPlan,
          [Validators.required, Validators.minLength(6)],
        ],
        recommendations: [initialValue.current.recommendations],
        vitals: this.fb.group({
          temperature: [
            initialValue.current.vitals.temperature,
            [Validators.min(34), Validators.max(42)],
          ],
          pulse: [
            initialValue.current.vitals.pulse,
            [Validators.min(40), Validators.max(200)],
          ],
          systolic: [
            initialValue.current.vitals.systolic,
            [Validators.min(60), Validators.max(260)],
          ],
          diastolic: [
            initialValue.current.vitals.diastolic,
            [Validators.min(30), Validators.max(180)],
          ],
          spo2: [
            initialValue.current.vitals.spo2,
            [Validators.min(70), Validators.max(100)],
          ],
          respiratoryRate: [
            initialValue.current.vitals.respiratoryRate,
            [Validators.min(8), Validators.max(40)],
          ],
        }),
      }),
      lifestyle: this.fb.group({
        activityLevel: [initialValue.lifestyle.activityLevel],
        sleepQuality: [initialValue.lifestyle.sleepQuality],
        stressLevel: [initialValue.lifestyle.stressLevel],
        nutrition: [initialValue.lifestyle.nutrition],
      }),
    });
  }

  ngOnDestroy(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.endTelemedCall();
    if (isPlatformBrowser(this.platformId)) {
      this.document.removeEventListener(
        "fullscreenchange",
        this.fullscreenHandler,
      );
      this.document.removeEventListener(
        "webkitfullscreenchange",
        this.fullscreenHandler,
      );
      this.document.removeEventListener(
        "mozfullscreenchange",
        this.fullscreenHandler,
      );
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.document.addEventListener("fullscreenchange", this.fullscreenHandler);
    this.document.addEventListener(
      "webkitfullscreenchange",
      this.fullscreenHandler,
    );
    this.document.addEventListener(
      "mozfullscreenchange",
      this.fullscreenHandler,
    );
    this.jitsiService
      .loadApi()
      .then(() => {
        this.jitsiReady = true;
      })
      .catch(() => {
        this.message.error(
          this.translate.instant("medicalData.patientVisit.telemed.error"),
        );
      });
  }

  get historyGroup(): FormGroup {
    return this.visitForm.get("history") as FormGroup;
  }

  get currentGroup(): FormGroup {
    return this.visitForm.get("current") as FormGroup;
  }

  get vitalsGroup(): FormGroup {
    return this.visitForm.get("current.vitals") as FormGroup;
  }

  get clinicalRiskLevel(): RiskLevel {
    const vitals = this.vitalsGroup?.value;
    if (!vitals) {
      return "low";
    }
    if (
      vitals.systolic >= 150 ||
      vitals.diastolic >= 95 ||
      vitals.spo2 <= 94 ||
      vitals.temperature >= 38.5
    ) {
      return "high";
    }
    if (
      vitals.systolic >= 135 ||
      vitals.diastolic >= 90 ||
      vitals.spo2 <= 96 ||
      vitals.temperature >= 37.5
    ) {
      return "medium";
    }
    return "low";
  }

  resetForm(): void {
    this.visitForm.reset(this.getInitialFormValue());
    this.visitForm.markAsPristine();
    this.visitForm.markAsUntouched();
  }

  submitVisit(): void {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }

    const payload = {
      patientId: this.patientProfile.id,
      ...this.visitForm.value,
    };

    // This will be replaced by API integration later.
    console.log("Patient visit payload", payload);

    this.isSaving = true;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.isSaving = false;
      this.lastSavedAt = new Date();
      this.visitForm.markAsPristine();
      this.message.success(
        this.translate.instant("medicalData.patientVisit.success"),
      );
    }, 600);
  }

  appendToField(path: string, snippet: string): void {
    const control = this.visitForm.get(path);
    if (!control) {
      return;
    }
    const currentText = (control.value || "").toString();
    const glue = currentText && !currentText.endsWith(" ") ? " " : "";
    control.setValue(`${currentText}${glue}${snippet}`.trim());
    control.markAsDirty();
    control.markAsTouched();
  }

  startTelemedCall(): void {
    if (!isPlatformBrowser(this.platformId) || this.jitsiApi) {
      return;
    }
    if (!this.jitsiReady || !window.JitsiMeetExternalAPI) {
      this.message.warning(
        this.translate.instant("medicalData.patientVisit.telemed.loading"),
      );
      return;
    }
    this.showTelemedCall = true;
    this.isTelemedModalVisible = true;
    this.cdr.detectChanges();
    if (!this.jitsiContainer) {
      this.message.error(
        this.translate.instant("medicalData.patientVisit.telemed.error"),
      );
      this.showTelemedCall = false;
      return;
    }
    const containerEl = this.jitsiContainer.nativeElement;
    const width =
      containerEl.getBoundingClientRect().width || window.innerWidth * 0.8;
    const height =
      containerEl.getBoundingClientRect().height || window.innerHeight * 0.6;
    const domain = this.jitsiDomain;
    const options = {
      roomName: `MIS-${this.telemedSession.id}`,
      parentNode: this.jitsiContainer.nativeElement,
      width,
      height,
      configOverwrite: {
        disableDeepLinking: true,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        TILE_VIEW_MAX_COLUMNS: 2,
        SHOW_CHROME_EXTENSION_BANNER: false,
        HIDE_INVITE_MORE_HEADER: true,
      },
      userInfo: {
        displayName:
          [this.currentUserInfo?.firstName, this.currentUserInfo?.lastName]
            .filter(Boolean)
            .join(" ") || this.telemedSession.doctorSide,
      },
    };

    this.jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
    this.jitsiApi.executeCommand("setTileView", true);
    this.jitsiApi.executeCommand("changeLanguage", "ru");
    this.jitsiApi.addEventListener("readyToClose", () => {
      this.endTelemedCall();
    });
  }

  endTelemedCall(): void {
    if (this.jitsiApi) {
      this.jitsiApi.dispose?.();
      this.jitsiApi = null;
    }
    this.showTelemedCall = false;
    this.isTelemedModalVisible = false;
    if (this.jitsiContainer) {
      this.jitsiContainer.nativeElement.innerHTML = "";
    }
  }

  resolveMetricState(controlName: string): "danger" | "warning" | "normal" {
    const value = this.vitalsGroup?.get(controlName)?.value;
    if (value === null || value === undefined) {
      return "normal";
    }
    switch (controlName) {
      case "temperature":
        if (value >= 38.5) return "danger";
        if (value >= 37.4) return "warning";
        return "normal";
      case "pulse":
        if (value >= 110 || value <= 45) return "danger";
        if (value >= 95 || value <= 55) return "warning";
        return "normal";
      case "systolic":
        if (value >= 150) return "danger";
        if (value >= 135) return "warning";
        return "normal";
      case "diastolic":
        if (value >= 95) return "danger";
        if (value >= 90) return "warning";
        return "normal";
      case "spo2":
        if (value <= 94) return "danger";
        if (value <= 96) return "warning";
        return "normal";
      case "respiratoryRate":
        if (value >= 26 || value <= 10) return "danger";
        if (value >= 22 || value <= 12) return "warning";
        return "normal";
      default:
        return "normal";
    }
  }

  isInvalid(path: string): boolean {
    const control = this.visitForm.get(path);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private getInitialFormValue(): PatientVisitFormValue {
    return {
      history: {
        chronicDiseases: ["hypertension", "diabetes"],
        allergies: ["seasonal"],
        medications: ["enalapril", "metformin"],
        surgeries: ["appendectomy_2010"],
        historyNotes:
          "Начало заболевания около 5 лет назад. Сезонные обострения, учитывает диету.",
      },
      current: {
        complaints:
          "Головная боль к концу смены, ощущение тяжести в ногах, утомляемость.",
        objectiveStatus:
          "Кожа чистая, дыхание везикулярное, отеков нет. Тоны сердца приглушены, давление стабильное.",
        diagnosis: "Гипертоническая болезнь II ст., риск 3.",
        treatmentPlan:
          "Продолжить базовую терапию, усилить контроль АД, рекомендовать ЛФК.",
        recommendations: "Отслеживать качество сна и питьевой режим.",
        vitals: {
          temperature: 36.8,
          pulse: 78,
          systolic: 138,
          diastolic: 86,
          spo2: 97,
          respiratoryRate: 17,
        },
      },
      lifestyle: {
        activityLevel: "moderate",
        sleepQuality: "unstable",
        stressLevel: "medium",
        nutrition: "balanced",
      },
    };
  }
}

