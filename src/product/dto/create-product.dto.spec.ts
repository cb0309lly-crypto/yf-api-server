import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { ProductStatus } from '../../entity/product';

describe('CreateProductDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateProductDto();
    dto.name = '测试商品';
    dto.price = 99.99;
    dto.description = '这是一个测试商品';
    dto.status = ProductStatus.ACTIVE;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when name is empty', async () => {
    const dto = new CreateProductDto();
    dto.price = 99.99;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isString).toBe('商品名称不能为空');
  });

  it('should fail validation when price is negative', async () => {
    const dto = new CreateProductDto();
    dto.name = '测试商品';
    dto.price = -10;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.min).toBe('商品价格不能小于0');
  });

  it('should fail validation when price is too high', async () => {
    const dto = new CreateProductDto();
    dto.name = '测试商品';
    dto.price = 1000000;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.max).toBe('商品价格不能超过999999.99');
  });

  it('should fail validation when imgUrl is invalid', async () => {
    const dto = new CreateProductDto();
    dto.name = '测试商品';
    dto.price = 99.99;
    dto.imgUrl = 'invalid-url';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isUrl).toBe('图片URL格式不正确');
  });

  it('should pass validation with valid imgUrl', async () => {
    const dto = new CreateProductDto();
    dto.name = '测试商品';
    dto.price = 99.99;
    dto.imgUrl = 'https://example.com/image.jpg';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
