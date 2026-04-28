package Reiudemo.demo;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller; // Dòng này quan trọng
import org.springframework.ui.Model; // Đảm bảo đã import Model
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam; // Import này cần thiết nếu bạn muốn sử dụng @PathVariable


@Controller
public class HelloController {

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping("/")
    public String getHistory(Model model, @RequestParam(required = false) String keyword) {
        List<Payment> list;
    
        if (keyword != null && !keyword.isEmpty()) {
            // Lọc những dòng có tên chứa từ khóa (không phân biệt hoa thường)
            list = paymentRepository.findAll().stream()
                    .filter(p -> p.getPaymentType().toLowerCase().contains(keyword.toLowerCase()))
                    .toList();
        } else {
            list = paymentRepository.findAll();
        }
        Map<String, Double> summaryMap = list.stream()
            .collect(Collectors.groupingBy(
                Payment::getPaymentType, 
                Collectors.summingDouble(Payment::getAmount)
            ));
    
        double total = list.stream().mapToDouble(Payment::getAmount).sum();
    
        model.addAttribute("payments", list);
        model.addAttribute("totalBalance", total);
        model.addAttribute("keyword", keyword); // Để giữ lại chữ đã gõ trong ô tìm kiếm
        model.addAttribute("summaryMap", summaryMap); // Thêm dữ liệu tổng hợp vào model
        return "history";
    }
    
    @GetMapping("/login")
    public String login() {
        return "login"; // Trả về file login.html
    }

    @GetMapping("/delete/{id}")
    public String deletePayment(@PathVariable Long id) {
        paymentRepository.deleteById(id);
        return "redirect:/";
    }

    // 1. Hàm để mở trang Sửa và hiện dữ liệu cũ lên
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model) {
        Payment p = paymentRepository.findById(id).orElse(null);
        model.addAttribute("payment", p);
        return "edit";
    }

    // 2. Hàm để lưu dữ liệu sau khi bạn đã sửa xong
    @PostMapping("/update")
    public String updatePayment(@RequestParam Long id, @RequestParam String paymentType, @RequestParam Double amount) {
        Payment p = paymentRepository.findById(id).orElse(null);
        if (p != null) {
            p.setPaymentType(paymentType);
            p.setAmount(amount);
            paymentRepository.save(p); // Lưu đè lên dữ liệu cũ
            }
        return "redirect:/";
        }

    @PostMapping("/add")
    public String addPayment(@RequestParam String paymentType, @RequestParam double amount) {
        Payment payment = new Payment();
        payment.setPaymentType(paymentType);
        payment.setAmount(amount);
        paymentRepository.save(payment);
        return "redirect:/"; 
    }

    @GetMapping("/clear")
    public String clearAll() {
        paymentRepository.deleteAll();
        return "redirect:/";
    }

}
