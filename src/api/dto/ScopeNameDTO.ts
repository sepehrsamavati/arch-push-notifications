import { Expose, Type } from "class-transformer";
import { IsDefined, IsNotEmpty, IsString, MaxLength } from "class-validator";

export default class ScopeNameDTO {
    @Expose()
    @Type(() => String)
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    /** Scope unique name */
    scope!: string;
}