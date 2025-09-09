import ScopeNameDTO from "./ScopeNameDTO.js";
import { Expose, Type } from "class-transformer";
import { ContentEncoding } from "../../types/enums.js";
import { IsDefined, IsEnum, IsString, MaxLength, MinLength } from "class-validator";

export default class RegisterDTO extends ScopeNameDTO {
    @Expose()
    @Type(() => String)
    @IsDefined()
    @IsString()
    @MinLength(20)
    @MaxLength(1e3)
    /** Client <-> Scope access token; To get user from scope validator endpoint */
    accessToken!: string;

    @Expose()
    @Type(() => String)
    @IsDefined()
    @IsString()
    @MinLength(50)
    @MaxLength(500)
    endpoint!: string;

    @Expose()
    @Type(() => String)
    @IsDefined()
    @IsString()
    @IsEnum(ContentEncoding)
    encoding!: ContentEncoding;

    @Expose()
    @Type(() => String)
    @IsDefined()
    @IsString()
    @MinLength(1)
    auth!: string;

    @Expose()
    @Type(() => String)
    @IsDefined()
    @IsString()
    @MinLength(20)
    p256dh!: string;
}