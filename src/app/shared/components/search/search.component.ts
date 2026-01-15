import { NzInputModule } from "ng-zorro-antd/input";
import { NzImageModule } from "ng-zorro-antd/image";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { debounceTime, Subject } from "rxjs";

@Component({
  selector: "app-search",
  standalone: true,
  imports: [NzInputModule, NzImageModule],
  templateUrl: "./search.component.html",
  styleUrl: "./search.component.css",
})
export class SearchComponent {
  @Output() search = new EventEmitter<string>();

  private input$ = new Subject<string>();

  constructor() {
    this.input$
      .pipe(debounceTime(500))
      .subscribe((value) => this.search.emit(value));
  }

  inputTrigger(event: any): void {
    const value = (event.target as HTMLInputElement).value;
    this.input$.next(value);
  }
}
