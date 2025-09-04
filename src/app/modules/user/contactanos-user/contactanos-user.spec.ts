import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactanosUser } from './contactanos-user';

describe('ContactanosUser', () => {
  let component: ContactanosUser;
  let fixture: ComponentFixture<ContactanosUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactanosUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactanosUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
