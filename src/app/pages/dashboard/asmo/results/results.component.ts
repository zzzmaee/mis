import { Component } from "@angular/core";
import { NzAlign, NzFlexModule, NzJustify } from "ng-zorro-antd/flex";
import { NzImageModule } from "ng-zorro-antd/image";

@Component({
  selector: "app-results",
  standalone: true,
  imports: [NzFlexModule, NzImageModule],
  templateUrl: "./results.component.html",
  styleUrl: "./results.component.less",
})
export class ResultsComponent {}
