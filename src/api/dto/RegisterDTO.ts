import { Type } from "class-transformer";
import { ContentEncoding } from "../../repository/mongo/fakeRepo.js";
import { IsDefined, IsEnum, MaxLength, MinLength } from "class-validator";

export default class RegisterDTO {
    @Type(() => String)
    @IsDefined()
    @MaxLength(100)
    userId!: string;

    @Type(() => String)
    @IsDefined()
    @MinLength(50)
    @MaxLength(500)
    endpoint!: string;

    @Type(() => String)
    @IsDefined()
    @IsEnum(ContentEncoding)
    encoding!: ContentEncoding;

    @Type(() => String)
    @IsDefined()
    auth!: string;

    @Type(() => String)
    @IsDefined()
    p256dh!: string;
}